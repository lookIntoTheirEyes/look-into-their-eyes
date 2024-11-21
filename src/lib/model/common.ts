import { Pathnames } from "@/i18n/routing";
import { Language } from "./language";

export const EMAIL = "look.into.their.eyes.0710@gmail.com";

export type CommentFormType = "visitor" | "family";

export interface CommentData {
  name: string;
  title: string;
  comment: string;
  email: string;
  type: CommentFormType;
}

export interface IModalProps {
  children: React.ReactNode;
  lang: Language;
  closeText?: string;
  center?: boolean;
  paths: { curr: Pathnames; next: Pathnames };
}
