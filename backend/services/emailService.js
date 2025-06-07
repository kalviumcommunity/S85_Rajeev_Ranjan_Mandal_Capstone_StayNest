const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'mandalrajeev3@gmail.com',
      pass: process.env.EMAIL_PASS // App password for Gmail
    }
  });
};

// Send support query notification email
const sendSupportQueryNotification = async (queryData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, subject, category, message, phone } = queryData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'mandalrajeev3@gmail.com',
      to: 'mandalrajeev3@gmail.com',
      subject: `StayNest Support Query: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏠 StayNest Support Query</h1>
          </div>
          
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">New Support Request</h2>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #667eea; margin: 0 0 10px 0;">📋 Query Details</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category.charAt(0).toUpperCase() + category.slice(1)}</p>
              <p><strong>Priority:</strong> ${category === 'technical' || category === 'billing' ? 'High' : 'Normal'}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #667eea; margin: 0 0 10px 0;">👤 Customer Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
              ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}" style="color: #667eea;">${phone}</a></p>` : ''}
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #667eea; margin: 0 0 10px 0;">💬 Message</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h3 style="color: #667eea; margin: 0 0 10px 0;">⏰ Timestamp</h3>
              <p><strong>Received:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:${email}?subject=Re: ${subject}" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                📧 Reply to Customer
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from StayNest Support System</p>
            <p style="margin: 5px 0 0 0;">Please respond to the customer within 2 hours as per our support policy</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Support query notification sent:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending support query notification:', error);
    return { success: false, error: error.message };
  }
};

// Send auto-reply to customer
const sendAutoReplyToCustomer = async (customerData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, subject } = customerData;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'mandalrajeev3@gmail.com',
      to: email,
      subject: `Re: ${subject} - StayNest Support [Ticket Received]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🏠 StayNest Support</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333;">Hi ${name},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for contacting StayNest Support! We have received your query and our team will get back to you within <strong>2 hours</strong>.
            </p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #667eea; margin: 0 0 10px 0;">📋 Your Query Details</h3>
              <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin: 0 0 10px 0;">🚀 What happens next?</h3>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Our support team will review your query</li>
                <li>You'll receive a detailed response within 2 hours</li>
                <li>For urgent issues, you can call us at <strong>+91 8871900963</strong></li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">💡 Quick Help</h3>
              <p style="color: #856404; margin: 0;">
                While you wait, check our <a href="http://localhost:5173/support" style="color: #667eea;">FAQ section</a> 
                for instant answers to common questions.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Best regards,<br>
              <strong>StayNest Support Team</strong><br>
              📧 mandalrajeev3@gmail.com<br>
              📞 +91 8871900963
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">This is an automated response. Please do not reply to this email.</p>
            <p style="margin: 5px 0 0 0;">For immediate assistance, contact us directly at mandalrajeev3@gmail.com</p>
          </div>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Auto-reply sent to customer:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSupportQueryNotification,
  sendAutoReplyToCustomer
};
