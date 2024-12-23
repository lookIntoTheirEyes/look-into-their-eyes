"use client";

import { imageLoader } from "@/lib/utils/utils";
import Image from "next/image";

interface LocalImageProps {
  alt?: string;
  imageUrl: string;
  borderRadius?: string;
  height?: number;
  priority?: boolean;
}

const LocalImage: React.FC<LocalImageProps> = ({
  alt = "imageUrl",
  imageUrl,
  height,
  priority = true,
  borderRadius = "4px",
}) => {
  return (
    <Image
      style={{ borderRadius }}
      src={imageUrl}
      alt={alt}
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      fill
      loader={({ src, quality: q }) => imageLoader({ src, height, quality: q })}
      priority={priority}
    />
  );
};
export default LocalImage;
