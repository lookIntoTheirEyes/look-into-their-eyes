"use client";

import { imageLoader } from "@/lib/utils/heroesService";
import Image from "next/image";

const LocalImage = ({
  alt = "imageUrl",
  imageUrl,
  borderRadius = "4px",
  width = 300,
}: {
  alt?: string;
  imageUrl: string;
  borderRadius?: string;
  width?: number;
}) => {
  return (
    <Image
      style={{ borderRadius }}
      src={imageUrl}
      alt={alt}
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      fill
      loader={() => imageLoader({ src: imageUrl, quality: 100, width })}
    />
  );
};
export default LocalImage;
