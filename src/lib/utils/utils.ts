import { Pathnames } from "@/i18n/routing";

export type SearchParams = Record<string, string | string[] | undefined>;

export function getPageNum(params: SearchParams) {
  return params.page
    ? Array.isArray(params.page)
      ? params.page[0]
      : params.page
    : "";
}

export interface BookActions {
  actions: { next: string; previous: string; cta: string };
}

export function getRoute(
  href: { pathname: Pathnames; query?: Record<string, string | number> },
  name: string
) {
  return { href, name };
}

export function getUpdatedPath(path: string, language: string, page = "") {
  const [, , ...route] = path.split("/");

  return `/${language}/${route.join("/")}${page ? `?page=${page}` : ""}`;
}
