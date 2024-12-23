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
  actions: { next: string; previous: string };
}

export function getRoute(
  href: { pathname: Pathnames; query?: Record<string, string | number> },
  name: string
) {
  return { href, name };
}

export function getImageUrl(url?: string) {
  const imageUrl = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!url) {
    return "";
  }

  return `https://res.cloudinary.com/${imageUrl}/image/upload/${url}`;
}

interface CloudinaryImageLoaderProps {
  src: string;
  height?: number;
  quality?: number;
}

export function imageLoader({
  src,
  quality = 100,
  height = 250,
}: CloudinaryImageLoaderProps) {
  const urlStart = src.split("upload/")[0];
  const urlEnd = src.split("upload/")[1];
  const transformations = `c_scale,h_${height},q_${quality}`;
  return `${urlStart}upload/${transformations}/${urlEnd}`;
}
