"use client";

import { Orientation } from "@/lib/model/book";
import { useCallback, useEffect, useRef, useState } from "react";

export interface BookStyle extends IRect {
  mode: Orientation;
}

interface IRect {
  height: number;
  width: number;
  top: number;
  left: number;
}

export function useBookStyle() {
  const bookContainerRef = useRef<HTMLDivElement>(null);
  const prevStyle = useRef({} as BookStyle);

  const [bookStyle, setBookStyle] = useState<BookStyle>({
    height: 0,
    width: 0,
    top: 0,
    left: 0,
    mode: Orientation.LANDSCAPE,
  });

  const calculateBookStyle = useCallback(({ width, top, left }: IRect) => {
    const aspectRatio = 1.7; // Ideal book aspect ratio
    const isMobile = width <= 600;

    let height = 0;

    if (isMobile) {
      height = width * aspectRatio;
    } else {
      height = width / aspectRatio;
    }

    const style = {
      width,
      height: height + 70,
      top,
      left,
      mode: isMobile ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
    };

    if (areRectsEqual(prevStyle.current, style)) {
      return;
    }

    prevStyle.current = style;
    setBookStyle(style);
  }, []);

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry.target === bookContainerRef.current) {
        const rect = bookContainerRef.current?.getBoundingClientRect();
        const { contentRect } = entry;
        const { width, height } = contentRect;
        const top = rect.top + contentRect.top;
        const left = rect.left + contentRect.left;

        calculateBookStyle({
          width,
          height,
          top,
          left,
        });
      }
    },
    [calculateBookStyle]
  );

  const isSinglePage = bookStyle.mode === Orientation.PORTRAIT;

  useEffect(() => {
    const container = bookContainerRef.current;
    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [handleResize]);

  const bookRect = {
    ...bookStyle,
    pageWidth: bookStyle.width / (isSinglePage ? 1 : 2),
  };

  return {
    bookContainerRef,
    bookStyle,
    isSinglePage,
    bookRect,
  };
}

function areRectsEqual(rect1: BookStyle, rect2: BookStyle): boolean {
  const threshold = 1;
  return (
    Math.abs(rect1.width - rect2.width) < threshold &&
    Math.abs(rect1.height - rect2.height) < threshold &&
    Math.abs(rect1.top - rect2.top) < threshold &&
    Math.abs(rect1.left - rect2.left) < threshold
  );
}
