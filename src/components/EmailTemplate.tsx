import { CommentData } from "@/lib/model/language";
import * as React from "react";

export const EmailTemplate: React.FC<CommentData> = ({
  name,
  comment,
  title,
  type,
  email,
}) => {
  const message =
    type === "family"
      ? "A new family member shared with us"
      : "A visitor added a comment";
  return (
    <div>
      <h1>This is from: {name}</h1>
      <p>{email}</p>
      <p>{message}</p>
      <p>title: {title}</p>
      <p>message: {comment}</p>
    </div>
  );
};
