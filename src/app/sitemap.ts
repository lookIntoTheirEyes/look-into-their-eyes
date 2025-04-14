import { MetadataRoute } from "next";
import { host } from "@/config";
import { getPathname, locales, pages, routing } from "@/i18n/routing";
import { Locale } from "next-intl";

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => getEntry(page));
}

type Href = Parameters<typeof getPathname>[0]["href"];

function getEntry(href: Href) {
  return {
    url: getUrl(href, routing.defaultLocale),
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, getUrl(href, locale)])
      ),
    },
  };
}

function getUrl(href: Href, locale: Locale) {
  const pathname = getPathname({ locale, href });
  return `${host}/${locale}${pathname === "/" ? "" : pathname}`;
}
