const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('REPLACE')) {
    console.warn('⚠️ SENDGRID_API_KEY is missing or invalid. Printing email to console instead:');
    console.log('\n--- MOCK EMAIL STARTED ---');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message payload: \n${options.message}`);
    console.log('--- MOCK EMAIL ENDED ---\n');
    return;
  }
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const message = {
    from: `${process.env.FROM_NAME || 'Golf Charity'} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await sgMail.send(message);
};

module.exports = sendEmail;
