import { Pathnames } from "@/i18n/routing";
import { ImageLoaderProps } from "next/image";

export type SearchParams = Record<string, string | string[] | undefined>;

export function getPageNum(params: SearchParams) {
  return params.page
    ? Array.isArray(params.page)
      ? params.page[0]
      : params.page
    : "";
}

export interface BookActions {
  actions: { next: string; previous: string };
}

export function getRoute(
  href: { pathname: Pathnames; query?: Record<string, string | number> },
  name: string
) {
  return { href, name };
}

export function getImageUrl(url: string) {
  const imageUrl = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  return `https://res.cloudinary.com/${imageUrl}/image/upload/${url}`;
}

export function imageLoader({
  src,
  quality = 100,
  width = 300,
}: ImageLoaderProps) {
  const urlStart = src.split("upload/")[0];
  const urlEnd = src.split("upload/")[1];
  const transformations = `w_${width},q_${quality}`;
  return `${urlStart}upload/${transformations}/${urlEnd}`;
}
