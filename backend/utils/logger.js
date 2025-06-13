const fs = require('fs').promises;
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');

class AsyncLogger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
    this.logQueue = [];
    this.isProcessing = false;
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(logsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}\n`;
  }

  async writeToFile(file, message) {
    this.logQueue.push({ file, message });
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.isProcessing = true;
    
    while (this.logQueue.length > 0) {
      const batch = this.logQueue.splice(0, 10); // Process in batches of 10
      
      try {
        await Promise.all(
          batch.map(async ({ file, message }) => {
            try {
              await fs.appendFile(file, message);
            } catch (error) {
              console.error(`Failed to write to log file ${file}:`, error);
            }
          })
        );
      } catch (error) {
        console.error('Error processing log queue:', error);
      }
    }
    
    this.isProcessing = false;
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️  ${message}`, meta);
    }
    
    this.writeToFile(this.logFile, formattedMessage);
  }

  error(message, meta = {}) {
    const errorMessage = message instanceof Error ? message.message : message;
    const errorStack = message instanceof Error ? message.stack : '';
    const formattedMessage = this.formatMessage('error', errorMessage, { 
      ...meta, 
      stack: errorStack 
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${errorMessage}`, meta);
      if (errorStack) console.error(errorStack);
    }
    
    this.writeToFile(this.errorFile, formattedMessage);
    this.writeToFile(this.logFile, formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  ${message}`, meta);
    }
    
    this.writeToFile(this.logFile, formattedMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.debug(`🐛 ${message}`, meta);
      this.writeToFile(this.logFile, formattedMessage);
    }
  }

  // Clean up old log files (keep last 30 days) - async version
  async cleanup() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const files = await fs.readdir(logsDir);
      
      await Promise.all(
        files.map(async (file) => {
          try {
            const filePath = path.join(logsDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < thirtyDaysAgo) {
              await fs.unlink(filePath);
              this.info(`Cleaned up old log file: ${file}`);
            }
          } catch (error) {
            this.error(`Failed to cleanup file ${file}`, { error: error.message });
          }
        })
      );
    } catch (error) {
      this.error('Failed to cleanup old log files', { error: error.message });
    }
  }

  // Graceful shutdown - flush remaining logs
  async shutdown() {
    console.log('Shutting down logger...');
    
    // Wait for queue to be processed
    while (this.logQueue.length > 0 || this.isProcessing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Logger shutdown complete');
  }
}

const logger = new AsyncLogger();

// Run cleanup weekly in production
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    logger.cleanup().catch(error => {
      console.error('Error during log cleanup:', error);
    });
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
}

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.shutdown().catch(console.error);
});

process.on('SIGINT', () => {
  logger.shutdown().catch(console.error);
});

module.exports = logger;
