import { AWS_SES, sender } from "./mailTrap.config.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

const sendEmail = async (toEmail, subject, htmlBody) => {
  const params = {
    Source: sender.email, 
    Destination: {
      ToAddresses: [toEmail], 
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
      },
    },
  };


  return AWS_SES.sendEmail(params).promise();
};


export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);

  try {
    const response = await sendEmail(email, "Verify your email", html);
    console.log("Verification email sent", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};


export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <h1>Welcome, ${name}!</h1>
    <p>Thanks for joining Klara. We're glad to have you!</p>
  `;

  try {
    const response = await sendEmail(email, "Welcome to Klara", html);
    console.log("Welcome email sent", response);
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};


export const sendPasswordResetEmail = async (email, resetURL) => {
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

  try {
    const response = await sendEmail(email, "Reset your password", html);
    console.log("Password reset email sent", response);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};


export const sendResetSuccessEmail = async (email) => {
  const html = PASSWORD_RESET_SUCCESS_TEMPLATE;

  try {
    const response = await sendEmail(email, "Password Reset Successful", html);
    console.log("Password reset success email sent", response);
  } catch (error) {
    console.error("Error sending password reset success email", error);
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};
