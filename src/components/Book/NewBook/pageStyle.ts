import { Interpolation, SpringValue, to } from "@react-spring/web";
import FlipCalculation, { ICalc } from "./FlipCalculation";
import { Corner, FlipCorner, FlipDirection, PageRect } from "./model";

import Helper from "./Helper";

const MIN_SHADOW_PROGRESS = 0.5;

function getBelowPageStyle({
  calculatedValues,
  isHardPage,
  direction,
  corner,
  bookRect,
  isRtl,
}: {
  isRtl: boolean;
  isHardPage: boolean;
  calculatedValues: Interpolation<ICalc | null>;
  direction: SpringValue<FlipDirection>;
  corner: SpringValue<Corner>;
  bookRect: PageRect;
}) {
  const pageWidth = bookRect.pageWidth;

  return {
    zIndex: calculatedValues.to((calc: ICalc) => {
      return !isHardPage && calc && calc.shadow.progress > MIN_SHADOW_PROGRESS
        ? 10
        : 1;
    }),
    clipPath: to(
      [corner, direction, calculatedValues],
      (corner, direction, calc) => {
        if (corner === "none" || !calc || isHardPage) return "none";
        const pageHeight = bookRect.height;
        calc = calc as ICalc;
        corner = corner as Corner;
        direction = direction as FlipDirection;

        const { intersectPoints, pos } = calc;

        const area = FlipCalculation.getFrontClipArea({
          ...intersectPoints,
          corner: corner.includes("top") ? FlipCorner.TOP : FlipCorner.BOTTOM,
          pageHeight,
          pageWidth,
        });

        return FlipCalculation.getSoftCss({
          position: pos,
          pageWidth,
          pageHeight,
          area,
          direction,
          angle: 0,
          factorPosition: FlipCalculation.getBottomPagePosition(
            direction,
            pageWidth,
            isRtl
          ),
          isRtl,
        });
      }
    ),
  };
}

function getSoftPageStyle(
  calc: Interpolation<ICalc | null>,
  corner: SpringValue<Corner>,
  direction: SpringValue<FlipDirection>,
  bookRect: PageRect,
  isFront: boolean,
  isRtl: boolean
) {
  const { pageWidth, height: pageHeight, width } = bookRect;
  return {
    clipPath: to([corner, direction, calc], (corner, direction, calc) => {
      if (corner === "none" || !calc || isFront) return "none";

      return getBackSoftClipPath({
        calc,
        corner,
        pageWidth,
        pageHeight,
        direction,
        isRtl,
      });
    }),
    transformOrigin: "0px 0px",
    transform: to([calc, corner, direction], (calc, corner, direction) => {
      if (corner === "none" || !calc || isFront) return "none";

      const { angle, rect } = calc;
      const activePos = FlipCalculation.convertToGlobal(
        FlipCalculation.getActiveCorner(direction, rect, isRtl),
        direction,
        width,
        isRtl
      );

      return `translate3d(${activePos!.x}px, ${
        activePos!.y
      }px, 0) rotate(${angle}rad)`;
    }),
    zIndex: corner.to((corner) => {
      // console.log("corner", corner);
      // console.log("isFront", isFront);

      if (isFront) return 3;
      return corner !== "none" ? 4 : 2;
    }),
  };
}

function getBackSoftClipPath({
  calc,
  corner,
  pageHeight,
  pageWidth,
  direction,
  isRtl,
}: {
  calc: ICalc;
  corner: Corner;
  pageWidth: number;
  pageHeight: number;
  direction: FlipDirection;
  isRtl: boolean;
}): string {
  if (!calc) {
    return "none";
  }

  const { intersectPoints, rect, pos: position, angle } = calc;
  const area = FlipCalculation.getFlippingClipArea({
    ...intersectPoints,
    rect,
    corner,
  });

  return FlipCalculation.getSoftCss({
    position,
    pageWidth,
    pageHeight,
    area,
    direction,
    angle,
    factorPosition: FlipCalculation.getActiveCorner(direction, rect, isRtl),
    isRtl,
  });
}

// function getFrontSoftClipPath({
//   calc,
//   pageHeight,
//   corner,
//   pageWidth,
// }: {
//   calc: ICalc;
//   pageHeight: number;
//   corner: Corner;
//   pageWidth: number;
// }): string {
//   const { intersectPoints } = calc;

//   const area = FlipCalculation.getFrontClipArea({
//     ...intersectPoints,
//     corner: corner.includes("top") ? FlipCorner.TOP : FlipCorner.BOTTOM,
//     pageHeight,
//     pageWidth,
//   });

//   const invertedPath = invertClipPath(area, pageWidth, pageHeight, corner);

//   return `polygon(${invertedPath
//     .filter((p): p is Point => !!p)
//     .map((p) => `${p!.x}px ${p!.y}px`)
//     .join(", ")})`;
// }

// function invertClipPath(
//   originalPoints: (Point | null)[],
//   pageWidth: number,
//   pageHeight: number,
//   corner: Corner = "top-right"
// ): Point[] {
//   if (!originalPoints.length) return [];
//   const points = originalPoints.filter((p) => p !== null);
//   if (!points.length) return [];

//   switch (corner) {
//     case "bottom-right": {
//       const bottomIntersect = points.find((p) => p?.y === pageHeight) ?? {
//         x: pageWidth,
//         y: pageHeight,
//       };
//       const sideIntersect = points.find((p) => p?.x === pageWidth) ?? {
//         x: pageWidth,
//         y: pageHeight,
//       };

//       return [
//         { x: 0, y: 0 },
//         { x: pageWidth, y: 0 },
//         { x: pageWidth, y: sideIntersect.y },
//         sideIntersect,
//         bottomIntersect,
//         { x: 0, y: pageHeight },
//       ];
//     }

//     case "top-right":
//       return [
//         { x: pageWidth, y: 0 },
//         ...points,
//         { x: 0, y: 0 },
//         { x: 0, y: pageHeight },
//         { x: pageWidth, y: pageHeight },
//       ];

//     default:
//       return [];
//   }
// }

function getHardPageStyle(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  pageWidth: number,
  isLeftPage: boolean,
  isRtl: boolean,
  isFront: boolean
) {
  return {
    display: progress.to((p) =>
      (isFront ? p < 50 : p >= 50) ? "block" : "none"
    ),
    transformOrigin: progress.to((p) =>
      Helper.getOrigin(isLeftPage, p, pageWidth)
    ),
    transform: getHardPageTransform(
      x,
      progress,
      direction,
      isLeftPage,
      isFront,
      pageWidth,
      isRtl
    ),
    zIndex: isFront ? 3 : progress.to((p) => (p > 50 ? 4 : 2)),
  };
}

function getHardPageTransform(
  x: SpringValue<number>,
  progress: SpringValue<number>,
  direction: SpringValue<FlipDirection>,
  isLeftPage: boolean,
  isFront: boolean,
  pageWidth: number,
  isRtl: boolean
) {
  return to([x, progress, direction], (x, p, dir) => {
    p = p as number;
    dir = dir as FlipDirection;
    const angle = Helper.getAngle(
      isLeftPage,
      p,
      isRtl
        ? dir
        : dir === FlipDirection.FORWARD
        ? FlipDirection.BACK
        : FlipDirection.FORWARD,
      !isFront
    );

    const shouldFlip = p >= 50 && !isFront;
    const translateX = p >= 50 ? (isLeftPage ? pageWidth : -pageWidth) : 0;

    return `
        translate3d(${translateX}px, 0, 0)
        rotateY(${angle}deg)
        ${shouldFlip ? "scaleX(-1)" : ""}
      `;
  });
}

const PageStyle = {
  getSoftPageStyle,
  getHardPageStyle,
  getBelowPageStyle,
};

export default PageStyle;
