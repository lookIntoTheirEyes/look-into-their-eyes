import { motion, useMotionValue } from "framer-motion";
import { animated, SpringValue, to } from "react-spring";
import { useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import Helper from "../Helper";
import { BookStyle } from "../useBookStyle";
import { FlipCorner, FlipDirection, PageMouseLocation } from "../model";

interface DraggingParams {
  corner: FlipCorner | null;
  direction: FlipDirection | null;
  page: { x: number; y: number; isLeft: boolean };
}

const initialDraggingParams: DraggingParams = {
  corner: null,
  direction: null,
  page: { x: 0, y: 0, isLeft: false },
};

interface Props {
  className: string;
  key: string;
  children: React.ReactNode;
  bookStyle: BookStyle;
  isRtl: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  scrollPosition: number;
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
  scrollPosition,
}) => {
  const [draggingParams, setDraggingParams] = useState(initialDraggingParams);

  const [{ angle }, setPage] = useState({ angle: 0 });

  //   const x = useMotionValue(page.x);
  //   const y = useMotionValue(page.y);

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
    const corner: FlipCorner =
      y >= bookStyle.height / 2 ? FlipCorner.BOTTOM : FlipCorner.TOP;
    const isLeftPage = Helper.isLeftPage(x, bookStyle);
    setDraggingParams((prev) => {
      return {
        ...prev,
        ...{ corner, page: { ...prev.page, isLeft: isLeftPage } },
      };
    });
  };

  const handleDrag = (
    directionArr: [number, number],
    [x, y]: [x: number, y: number]
  ) => {
    if (!draggingParams.direction && directionArr[0]) {
      const direction = getFlipDirection(directionArr[0], isRtl);

      setDraggingParams((prev) => {
        return { ...prev, ...{ direction } };
      });
    }

    // console.log("x", x);
    // console.log("isLeftPage", isLeftPage);
    // console.log("isback", draggingParams.direction === FlipDirection.BACK);

    if (draggingParams.direction) {
      //   const progress = FlipCalculation.getFlippingProgress(
      //     x - bookStyle.width / 2,
      //     bookStyle.width / 2
      //   );
      //   const angle = FlipCalculation.getAngle(
      //     draggingParams.direction,
      //     progress
      //   );
      //   console.log("angle", progress, angle);
      //   setPage({ angle });
    }
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
        isLeftPage: draggingParams.page.isLeft,
      });
    }
    setDraggingParams(initialDraggingParams);
    setPage({ angle: 0 });
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
        handleDrag(state.direction, state.xy);
        // const y = state.xy[1] + scrollPosition
      },

      onDragEnd: ({ event }) => {
        // console.log(event);

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
    <animated.div
      //   style={{ rotateY: `${angle * 2}deg` }}
      ref={ref}
      className={`${className} animated`}
    >
      {children}
    </animated.div>
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
  isLeftPage,
}: {
  x: number;
  bookStyle: BookStyle;
  isRtl: boolean;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  dragThreshold: number;
  isLeftPage: boolean;
}) {
  const clickLocation = Helper.getXClickLocation(
    x,
    isLeftPage,
    dragThreshold,
    bookStyle
  );
  // console.log("clickLocation", clickLocation);
  // console.log("isLeftDragging", isLeftPage);

  setFlipOnDrag(
    clickLocation,
    isLeftPage,
    isRtl,
    handleNextPage,
    handlePrevPage
  );
}

function getFlipDirection(x: number, isRtl: boolean): FlipDirection {
  if (isRtl) {
    return x < 0 ? FlipDirection.BACK : FlipDirection.FORWARD;
  } else {
    return x > 0 ? FlipDirection.BACK : FlipDirection.FORWARD;
  }
}
