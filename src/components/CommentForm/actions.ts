"use server";

import { CommentData } from "@/lib/model/language";
import nodemailer from "nodemailer";

export async function sendCommentEmail(data: CommentData) {
  console.log("CommentData", data);

  try {
    // Configure your email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Comment from ${data.name}`,
      text: `
        Name: ${data.name}
        Title: ${data.title}
        
        Comment:
        ${data.comment}
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false };
  }
}
