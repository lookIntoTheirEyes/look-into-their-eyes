"use client";

import { imageLoader } from "@/lib/utils/utils";
import Image from "next/image";

const LocalImage = ({
  alt = "imageUrl",
  imageUrl,
  height,
  priority = false,
  borderRadius = "4px",
}: {
  alt?: string;
  imageUrl: string;
  borderRadius?: string;
  height?: number;
  priority?: boolean;
}) => {
  return (
    <Image
      style={{ borderRadius }}
      src={imageUrl}
      alt={alt}
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      fill
      loader={({ src, width: _w, quality: q }) =>
        imageLoader({ src, height, quality: q })
      }
      priority={priority}
    />
  );
};
export default LocalImage;
