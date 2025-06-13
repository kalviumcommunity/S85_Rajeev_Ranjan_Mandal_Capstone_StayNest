const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}\n`;
  }

  writeToFile(file, message) {
    try {
      fs.appendFileSync(file, message);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
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

  // Clean up old log files (keep last 30 days)
  cleanup() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const files = fs.readdirSync(logsDir);
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned up old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to cleanup old log files', { error: error.message });
    }
  }
}

const logger = new Logger();

// Run cleanup weekly
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    logger.cleanup();
  }, 7 * 24 * 60 * 60 * 1000); // 7 days
}

module.exports = logger;
