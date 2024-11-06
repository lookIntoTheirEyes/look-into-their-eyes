import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { Language } from "@/lib/model/language";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Language;

  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    messages: (await import(`../../messages/${locale}.json`)).default,
    locale,
  };
});
