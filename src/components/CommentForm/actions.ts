"use server";

import { CommentData } from "@/lib/model/language";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/EmailTemplate";
import { NextResponse } from "next/server";

export async function sendCommentEmail(commentData: CommentData) {
  const resend = new Resend(process.env.NEXT_PRIVATE_RESEND_API_KEY);
  try {
    const email = "look.into.their.eyes.0710@gmail.com";

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [email],
      subject: commentData.title,
      react: EmailTemplate({
        name: commentData.name,
        title: commentData.title,
        comment: commentData.comment,
        type: commentData.type,
      }) as React.ReactElement,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data, message: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
