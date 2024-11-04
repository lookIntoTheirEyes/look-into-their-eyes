import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { Language } from "@/lib/model/language";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) as Language;

  if (!routing.locales.includes(locale)) notFound();

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
