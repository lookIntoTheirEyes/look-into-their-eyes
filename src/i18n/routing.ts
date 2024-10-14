import { defineRouting } from "next-intl/routing";
import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { Language } from "../app/model/language";

export const routing = defineRouting({
  locales: [Language.en, Language.he],
  defaultLocale: Language.he,
});

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
