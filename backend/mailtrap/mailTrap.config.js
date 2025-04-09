import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
import AWS from "aws-sdk"

dotenv.config();

// const TOKEN = process.env.MAILTRAP_TOKEN;
// const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

const SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
}

const AWS_SES = new AWS.SES(SES_CONFIG);

export const mailtrapclient = new MailtrapClient({
  token: TOKEN,
  endpoint : ENDPOINT
});

export const sender = {
  email: "matiyaqoobal@gmail.com",
  name: "AWS-Email",
};

// const recipients = [
//   {
//     email: "matiyaqoobal@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     text: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);