import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { Language } from "@/lib/model/language";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (
      await (locale === Language.en
        ? import(`../../messages/${Language.en}.json`)
        : import(`../../messages/${locale}.json`))
    ).default,
  };
});
