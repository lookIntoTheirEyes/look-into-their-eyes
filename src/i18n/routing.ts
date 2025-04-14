import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { Language } from "@/lib/model/language";

export const locales = Object.values(Language) as [string, ...string[]];
export const defaultLocale = Language.he;

const pathnames = {
  "/": "/",
  "/about": "/about",
  "/story": "/story",
  "/story/details": "/story/details",
  "/accessibility": "/accessibility",
  "/privacy": "/privacy",
  "/terms": "/terms",
  "/visitors": "/visitors",
  "/visitors/new": "/visitors/new",
  "/families": "/families",
  "/families/new": "/families/new",
} as const;

export const routing = defineRouting({
  locales: locales,
  defaultLocale: defaultLocale,
  pathnames: pathnames,
});

export const pages = Object.keys(pathnames) as (keyof typeof pathnames)[];

export type Pathnames = keyof typeof pathnames;

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing);
