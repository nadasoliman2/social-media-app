import nodemailer from "nodemailer";
import { EMAIL_USER , EMAIL_PASS, APPLICATION_NAME } from "../../../config/config.service.js";

interface SendEmailOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  attachments?: any[];
  html: string;
}

export const sendEmail = async (
  {
    to,
    cc,
    bcc,
    subject,
    attachments = [],
    html
  }: SendEmailOptions
): Promise<void> => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${APPLICATION_NAME}" <${EMAIL_USER}>`,
    to,
    subject,
    cc,
    bcc,
    html,
    attachments
  });
};