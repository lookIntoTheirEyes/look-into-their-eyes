import { Orientation } from "@/lib/model/book";
import { useCallback, useEffect, useRef, useState } from "react";

export interface BookStyle {
  height: number;
  width: number;
  top: number;
  left: number;
  mode: Orientation;
}

export function useBookStyle() {
  const bookContainerRef = useRef<HTMLDivElement>(null);

  const [bookStyle, setBookStyle] = useState<BookStyle>({
    height: 0,
    width: 0,
    top: 0,
    left: 0,
    mode: Orientation.LANDSCAPE,
  });

  const calculateBookStyle = useCallback(
    ({
      width: containerWidth,
      height: containerHeight,
      top,
      left,
    }: DOMRectReadOnly) => {
      const aspectRatio = 1.4; // Ideal book aspect ratio
      const isMobile = containerWidth <= 600;

      let height = 0,
        width = 0;

      if (isMobile) {
        height = containerWidth * aspectRatio;
      } else {
        height = containerWidth / aspectRatio;

        if (height > containerHeight) {
          height = containerHeight;
          width = height * aspectRatio;
        }
      }

      setBookStyle({
        width: width || containerWidth,
        height: height + 70,
        top,
        left,
        mode: isMobile ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
      });
    },
    []
  );

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
          ...contentRect,
          ...{ width, height, top, left },
        });
      }
    },
    [calculateBookStyle]
  );

  const isSinglePage = bookStyle.mode === Orientation.PORTRAIT;

  useEffect(() => {
    const container = bookContainerRef.current; // Capture the current value of the ref
    const resizeObserver = new ResizeObserver(handleResize);

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container); // Use the captured container reference
      }
    };
  }, [handleResize]);

  return {
    bookContainerRef,
    bookStyle,
    isSinglePage,
  };
}
