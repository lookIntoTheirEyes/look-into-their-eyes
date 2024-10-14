export const Language = {
  he: "he",
  en: "en",
} as const;

export type Language = (typeof Language)[keyof typeof Language];
