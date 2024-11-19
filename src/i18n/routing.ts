import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { Language } from "@/lib/model/language";

export const pages = [
  "/",
  "/about",
  "/story",
  "/story/details",
  "/privacy",
  "/terms",
  "/accessibility",
  "/families",
  "/families/new",
  "/visitors-book",
  "/visitors-book/new",
];

export const routing = defineRouting({
  locales: Object.values(Language),
  defaultLocale: Language.he,
  pathnames: Object.fromEntries(pages.map((page) => [page, page])),
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
