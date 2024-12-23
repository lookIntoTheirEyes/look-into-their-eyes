"use client";

import { imageLoader } from "@/lib/utils/utils";
import Image from "next/image";
// import styles from "./Image.module.css";

interface LocalImageProps {
  alt?: string;
  imageUrl: string;
  height?: number;
  borderRadius?: string;
  priority?: boolean;
}

const LocalImage: React.FC<LocalImageProps> = ({
  alt = "imageUrl",
  imageUrl,
  height = 250,
  priority = true,
  borderRadius = "4px",
}) => {
  return (
    <Image
      style={{ borderRadius, width: "auto", height }}
      src={imageUrl}
      alt={alt}
      height={220}
      width={440}
      loader={({ src, quality: q }) => imageLoader({ src, height, quality: q })}
      priority={priority}
    />
  );
};

export default LocalImage;
