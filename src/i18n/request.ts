import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { Language } from "@/lib/model/language";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Language)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (
      await (locale === Language.en
        ? import(`../../messages/${Language.en}.json`)
        : import(`../../messages/${locale}.json`))
    ).default,
  };
});
