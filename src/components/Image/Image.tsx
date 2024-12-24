"use client";

import Image from "next/image";

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
  const getTransformedUrl = (src: string, height: number) => {
    const [urlStart, urlEnd] = src.split("upload/");
    const transformations = `c_scale,h_${height},q_100`;
    return `${urlStart}upload/${transformations}/${urlEnd}`;
  };

  const optimizedUrl = getTransformedUrl(imageUrl, height);

  return (
    <Image
      src={optimizedUrl}
      alt={alt}
      style={{ borderRadius, width: "auto", height }}
      width={500}
      height={500}
      unoptimized
      priority={priority}
    />
  );
};

export default LocalImage;
