const { sendSupportQueryNotification, sendAutoReplyToCustomer } = require('../services/emailService');

// Handle support query submission
const submitSupportQuery = async (req, res) => {
  try {
    const { name, email, subject, category, message, phone } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Prepare query data
    const queryData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      category: category.trim(),
      message: message.trim(),
      phone: phone ? phone.trim() : null,
      timestamp: new Date()
    };

    // Send notification email to admin
    const notificationResult = await sendSupportQueryNotification(queryData);
    
    // Send auto-reply to customer
    const autoReplyResult = await sendAutoReplyToCustomer(queryData);

    if (notificationResult.success) {
      res.status(200).json({
        success: true,
        message: 'Your query has been submitted successfully! We\'ll get back to you within 2 hours.',
        data: {
          queryId: notificationResult.messageId,
          autoReplySent: autoReplyResult.success
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to submit your query. Please try again or contact us directly.',
        error: notificationResult.error
      });
    }

  } catch (error) {
    console.error('Error in submitSupportQuery:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message
    });
  }
};

// Handle phone support request (log the call request)
const requestPhoneSupport = async (req, res) => {
  try {
    const { name, email, phone, preferredTime, issue } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and phone number'
      });
    }

    // Prepare callback request data
    const callbackData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      preferredTime: preferredTime || 'ASAP',
      issue: issue ? issue.trim() : 'General Support',
      timestamp: new Date()
    };

    // Send notification email for phone support request
    const notificationResult = await sendSupportQueryNotification({
      ...callbackData,
      subject: `Phone Support Request - ${callbackData.issue}`,
      category: 'phone-support',
      message: `Customer requested a phone callback.\n\nPreferred Time: ${callbackData.preferredTime}\nIssue: ${callbackData.issue}\nPhone: ${callbackData.phone}`
    });

    if (notificationResult.success) {
      res.status(200).json({
        success: true,
        message: 'Phone support request submitted! We\'ll call you back within 30 minutes.',
        data: {
          requestId: notificationResult.messageId,
          estimatedCallTime: '30 minutes'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to submit phone support request. Please try calling us directly at +91 8871900963.',
        error: notificationResult.error
      });
    }

  } catch (error) {
    console.error('Error in requestPhoneSupport:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
      error: error.message
    });
  }
};

// Get support statistics (for admin dashboard - future use)
const getSupportStats = async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return mock data
    const stats = {
      totalQueries: 0,
      pendingQueries: 0,
      resolvedQueries: 0,
      averageResponseTime: '1.5 hours',
      categories: {
        booking: 0,
        hosting: 0,
        payments: 0,
        technical: 0,
        general: 0
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in getSupportStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support statistics',
      error: error.message
    });
  }
};

module.exports = {
  submitSupportQuery,
  requestPhoneSupport,
  getSupportStats
};
