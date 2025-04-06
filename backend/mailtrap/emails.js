import { mailtrapclient, sender } from "./mailTrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";


export const sendVerificationEmail = async (email, verificationToken) => {
  const recipients = [{ email }];

  try {
    const response = await mailtrapclient.send({
      from: sender,
      to: recipients,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification:", error);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {

  const recipients = [{ email }]

  try {
    const response = await mailtrapclient.send({
      from: sender,
      to: recipients,
      template_uuid: "9ba02f22-cd06-4563-9d08-283aa479884a",
      template_variables: {
        "company_info_name": "Klara",
        "name": name
      }
    })
    console.log("Email sent successfully", response)
  } catch (error) {

    throw new Error(`error sending welcome email:${error}`)
  }
}