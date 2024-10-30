import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { Language } from "@/lib/model/language";

export default getRequestConfig(async ({ locale }) => {
  if (!routing.locales.includes(locale as Language)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
