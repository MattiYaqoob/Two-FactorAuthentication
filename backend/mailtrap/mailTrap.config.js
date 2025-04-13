import dotenv from "dotenv";
import { SESClient } from "@aws-sdk/client-ses";

dotenv.config();

export const AWS_SES = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sender = {
  email: "matiyaqoobal@gmail.com",
  name: "AWS-Email",
};