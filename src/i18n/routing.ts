import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { Language } from "../lib/model/language";

export const routing = defineRouting({
  locales: [Language.en, Language.he],
  defaultLocale: Language.he,
  pathnames: {
    "/": "/",
    "/about": "/about",
    "/story": "/story",
    "/accessibility": "/accessibility",
    "/privacy": "/privacy",
    "/terms": "/terms",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
