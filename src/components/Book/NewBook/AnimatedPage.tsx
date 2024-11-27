import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import Helper from "./Helper";
import { BookStyle } from "./useBookStyle";
import { FlipCorner, FlipDirection, PageMouseLocation } from "./model";

interface DraggingParams {
  corner: FlipCorner | null;
  direction: FlipDirection | null;
}

const initialDraggingParams: DraggingParams = {
  corner: null,
  direction: null,
};

interface Props {
  className: string;
  key: string;
  children: React.ReactNode;
  bookStyle: BookStyle;
  isRtl: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  handleNextPage: () => void;
  handlePrevPage: () => void;
}

const AnimatedPage: React.FC<Props> = ({
  className,
  children,
  bookStyle,
  isRtl,
  handleNextPage,
  handlePrevPage,
  isLastPage,
  isFirstPage,
}) => {
  const [draggingParams, setDraggingParams] = useState(initialDraggingParams);

  const ref = useRef<HTMLDivElement>(null);
  const dragThreshold = bookStyle.width / 4;

  const clickHandler = (x: number) => {
    const isLeftPage = Helper.isLeftPage(x, bookStyle);
    const clickLocation = Helper.getXClickLocation(
      x,
      isLeftPage,
      dragThreshold,
      bookStyle
    );
    setFlipOnClick(clickLocation, isRtl, handleNextPage, handlePrevPage);
  };

  const handleDragStart = (x: number, y: number) => {
    const direction = Helper.getDirectionByPoint({ x, y }, bookStyle, isRtl);
    const flipCorner: FlipCorner =
      y >= bookStyle.height / 2 ? FlipCorner.BOTTOM : FlipCorner.TOP;
    setDraggingParams({
      corner: flipCorner,
      direction,
    });
  };

  const handleDragEnd = (x: number) => {
    if (
      (draggingParams.direction === FlipDirection.FORWARD && !isLastPage) ||
      (draggingParams.direction === FlipDirection.BACK && !isFirstPage)
    ) {
      dragEndHelper({
        x,

        bookStyle,
        isRtl,
        handleNextPage,
        handlePrevPage,
        dragThreshold,
      });
    }
    setDraggingParams(initialDraggingParams);
  };

  useGesture(
    {
      onDragStart: (state) => {
        const event = state.event as PointerEvent;
        handleDragStart(event.x, event.y);
      },
      onClick: ({ event: { x, target } }) => {
        if ((target as HTMLElement).tagName === "BUTTON") {
          return;
        }

        clickHandler(x);
      },
      onDrag: (state) => {
        if (!state.dragging) {
          return;
        }
      },

      onDragEnd: ({ event }) => {
        handleDragEnd((event as PointerEvent).x);
      },
    },
    {
      drag: { preventScroll: true, filterTaps: true },

      target: ref,
      eventOptions: { passive: false },
    }
  );

  return (
    <motion.div ref={ref} className={`${className} animated`}>
      {children}
    </motion.div>
  );
};
export default AnimatedPage;

function setFlipOnClick(
  clickLocation: PageMouseLocation,
  isRtl: boolean,
  handleNextPage: () => void,
  handlePrevPage: () => void
) {
  if (clickLocation === "leftPageRight" || clickLocation === "rightPageLeft") {
    return;
  }

  if (isRtl) {
    if (clickLocation === "leftPageLeft") {
      handleNextPage();
    } else {
      handlePrevPage();
    }
  } else {
    if (clickLocation === "leftPageLeft") {
      handlePrevPage();
    } else {
      handleNextPage();
    }
  }
}

function setFlipOnDrag(
  clickLocation: PageMouseLocation,
  isLeftDragging: boolean,
  isRtl: boolean,
  handleNextPage: () => void,
  handlePrevPage: () => void
) {
  if (isRtl) {
    if (isLeftDragging) {
      if (clickLocation !== "leftPageLeft") {
        handleNextPage();
      }
    } else {
      if (clickLocation !== "rightPageRight") {
        handlePrevPage();
      }
    }
  } else {
    if (isLeftDragging) {
      if (clickLocation !== "leftPageLeft") {
        handlePrevPage();
      }
    } else {
      if (clickLocation !== "rightPageRight") {
        handleNextPage();
      }
    }
  }
}

function dragEndHelper({
  x,

  bookStyle,
  isRtl,
  handleNextPage,
  handlePrevPage,
  dragThreshold,
}: {
  x: number;

  bookStyle: BookStyle;
  isRtl: boolean;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  dragThreshold: number;
}) {
  const isLeftPage = Helper.isLeftPage(x, bookStyle);
  const clickLocation = Helper.getXClickLocation(
    x,
    isLeftPage,
    dragThreshold,
    bookStyle
  );

  setFlipOnDrag(
    clickLocation,
    isLeftPage,
    isRtl,
    handleNextPage,
    handlePrevPage
  );
}
