import { CommentData } from "@/lib/model/common";
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
      <p>{message}!!</p>
      <h1>This is from: {name}</h1>
      <p>email: {email}</p>
      <p>title: {title}</p>
      <p>message: {comment}</p>
    </div>
  );
};
