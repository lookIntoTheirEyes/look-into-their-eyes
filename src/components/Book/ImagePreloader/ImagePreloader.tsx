"use client";
import { useEffect } from "react";

export const ImagePreloader = ({ urls }: { urls: string[] }) => {
  useEffect(() => {
    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);

  return null;
};
