import { useDrag, useGesture } from "@use-gesture/react";
import {
  animated,
  useSprings,
  SpringValue,
  to as interpolate,
} from "react-spring";
import { PageData } from "./AnimatedPages";
import Helper from "../Helper";
import { BookStyle } from "../useBookStyle";
import { FlipCorner, FlipDirection, PageMouseLocation } from "../model";

import { useCallback, useEffect, useState } from "react";

interface PagesProps {
  Pages: PageData;
  bookStyle: BookStyle;
  handleNextPage: () => void;
  handlePrevPage: () => void;
  isRtl: boolean;
}

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

const map: Record<number, keyof PageData> = {
  0: "main",
  1: "back",
  2: "below",
};

// const to = (i: number) => ({
//   x: 0,
//   y: 0,
//   scale: 1,
//   rot: -10 + Math.random() * 20,
//   delay: i * 100,
// });
// const from = (_i: number) => ({ x: 0, rot: 0, scale: 1.5, y: 0 });

const trans = (r: number, s: number) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

const Pages: React.FC<PagesProps> = ({
  Pages,
  bookStyle,
  handleNextPage,
  handlePrevPage,
  isRtl,
}) => {
  const dragThreshold = bookStyle.width / 4;
  const pageWidth = bookStyle.width / 2;
  const bookHeight = bookStyle.height;
  console.log("Pages", Pages.main.key);

  const from = useCallback(
    (i: number, move: string = "", immediate = false) => ({
      x: !move ? 0 : move === "next" ? -pageWidth : pageWidth,
      // x: 0,
      y: 0,
      x1: 0,
      y1: 0,
      x2: pageWidth,
      y2: 0,
      x3: pageWidth,
      y3: bookHeight,
      x4: 0,
      y4: bookHeight,
      x5: 0,
      y5: bookHeight,
      z: i === 0 ? 2 : i >= 2 ? 0 : 1,
      display: i === 1 ? "block" : "none",
      bgPos: 0,
      bgPosY: 0,
      bgRad: 0,
      bgHeight: bookHeight,
      bgDisplay: "none",
      bgY2: 0,
      r: 0,
      scaleX: 1,
      immediate,
    }),
    [bookHeight, pageWidth]
  );

  const [draggingParams, setDraggingParams] = useState(initialDraggingParams);

  const [props, api] = useSprings(Object.values(Pages).length, (i) => ({
    ...from(i),
    from: from(i),
  })); // Create a bunch of springs using the helpers above

  const bind = useGesture(
    {
      onClick: (params) => {
        clickHandler(params.event.pageX);
      },
      onDragStart: ({ xy: [x, y] }) => {
        handleDragStart(x, y);
      },
      onDragEnd: (params) => {
        const {
          direction: [x],
        } = params;
        console.log("onDragEnd", params);

        const dir =
          x < 1
            ? isRtl
              ? FlipDirection.FORWARD
              : FlipDirection.BACK
            : isRtl
            ? FlipDirection.BACK
            : FlipDirection.FORWARD;
        api.start((i) => from(i, "next"));

        dragEndHelper({
          x,
          bookStyle,
          isRtl,
          handleNextPage,
          handlePrevPage,
          dragThreshold,
          isLeftPage: draggingParams.page.isLeft,
        });

        console.log("finished is back", dir === FlipDirection.BACK);
      },
      onDrag: (params) => {
        const {
          args: [index],
          movement: [mx],
          direction: [xDir],
          down,
          tap,
        } = params;
        if (!down || tap) {
          return;
        }

        if (!draggingParams.direction && xDir) {
          const direction = getFlipDirection(xDir, isRtl);

          setDraggingParams((prev) => {
            return { ...prev, ...{ direction } };
          });
        }

        api.start((i) => {
          if (index !== i) return;

          return {
            ...from,
            x: mx,
            config: { friction: 50, tension: down ? 800 : 500 },
            // immediate: true,
          };
        });
      },
    },
    { drag: { filterTaps: true, rubberband: true } }
  );

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

  console.log("=====================================");

  const clickHandler = (x: number) => {
    const isLeftPage = Helper.isLeftPage(x, bookStyle);
    const clickLocation = Helper.getXClickLocation(
      x,
      isLeftPage,
      dragThreshold,
      bookStyle
    );
    const isMove = isMoveToPage(clickLocation, isRtl);
    switch (isMove) {
      case "next":
        api.start((i) => from(i, "next"));
        handleNextPage();
        // api.start((i) => from(i, "prev", true));
        break;
      case "prev":
        api.start((i) => from(i, "prev"));
        handlePrevPage();
        // api.start((i) => from(i, "next", true));
        break;
      default:
        break;
    }
  };

  return (
    <>
      {props.map(({ x, y }, i) => {
        // if (i === 1) {
        //   return;
        // }
        const page = Pages[map[i]];
        // console.log("page", page);

        return (
          <animated.div
            key={page?.key}
            className={page?.className}
            style={{ x, y }}
          >
            <animated.div
              {...bind(i)}
              style={{
                touchAction: "none",
                height: "100%",
                // transform: interpolate([rot, scale], trans),
              }}
            >
              {page?.["view"]}
            </animated.div>
          </animated.div>
        );
      })}
    </>
  );
};

export default Pages;

function isMoveToPage(clickLocation: PageMouseLocation, isRtl: boolean) {
  if (clickLocation === "leftPageRight" || clickLocation === "rightPageLeft") {
    return;
  }
  console.log("clickLocation", clickLocation);

  if (isRtl) {
    if (clickLocation === "leftPageLeft") {
      return "next";
    } else {
      return "prev";
    }
  } else {
    if (clickLocation === "leftPageLeft") {
      return "prev";
    } else {
      return "next";
    }
  }
}

function getFlipDirection(x: number, isRtl: boolean): FlipDirection {
  if (isRtl) {
    return x < 0 ? FlipDirection.BACK : FlipDirection.FORWARD;
  } else {
    return x > 0 ? FlipDirection.BACK : FlipDirection.FORWARD;
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

function setFlipOnDrag(
  clickLocation: PageMouseLocation,
  isLeftDragging: boolean,
  isRtl: boolean,
  handleNextPage: () => void,
  handlePrevPage: () => void
) {
  console.log("clickLocation", clickLocation);
  console.log("isLeftDragging", isLeftDragging);
  console.log("isRtl", isRtl);

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
