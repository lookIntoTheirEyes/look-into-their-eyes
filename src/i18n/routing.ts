import { createLocalizedPathnamesNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { Language } from "../app/model/language";

export const routing = defineRouting({
  locales: [Language.en, Language.he],
  defaultLocale: Language.he,
  pathnames: {
    "/": "/",
    "/about": "/about",
    "/story": "/story",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation(routing);
