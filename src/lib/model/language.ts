export const Language = {
  he: "he",
  en: "en",
} as const;

export type Language = (typeof Language)[keyof typeof Language];

export interface ILanguageProps {
  params: Promise<{ locale: Language }>;
}

export type CommentFormType = "visitor" | "family";

export interface CommentData {
  name: string;
  title: string;
  comment: string;
  type: CommentFormType;
}
