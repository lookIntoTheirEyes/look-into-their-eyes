import { Interpolation, SpringValue, to } from "@react-spring/web";
import FlipCalculation, { ICalc } from "./FlipCalculation";
import { Corner, FlipCorner, FlipDirection, PageRect } from "./model";

import Helper from "./Helper";

const MIN_SHADOW_PROGRESS = 0.5;

/**
 * Get styles for the page below the current flipping page
 */
function getBelowPageStyle({
  calculatedValues,
  isHardPage,
  direction,
  corner,
  bookRect,
  isRtl,
  progress,
}: {
  isRtl: boolean;
  isHardPage: boolean;
  calculatedValues: Interpolation<ICalc | null>;
  direction: SpringValue<FlipDirection>;
  corner: SpringValue<Corner>;
  progress: SpringValue<number>;
  bookRect: PageRect;
}) {
  const pageWidth = bookRect.pageWidth;

  return {
    zIndex: to(
      [calculatedValues, progress],
      (calc: ICalc | null, progress: number) => {
        return !isHardPage &&
          calc &&
          calc.shadow.progress > MIN_SHADOW_PROGRESS &&
          progress > MIN_SHADOW_PROGRESS
          ? 10
          : 1;
      }
    ),
    clipPath: to(
      [corner, direction, calculatedValues],
      (corner, direction, calc) => {
        if (corner === "none" || !calc || isHardPage) return "none";
        const pageHeight = bookRect.height;

        // Safe type assertions
        const calcValue = calc as ICalc;
        const cornerValue = corner as Corner;
        const directionValue = direction as FlipDirection;

        const { intersectPoints, pos } = calcValue;

        const topBottomCorner = cornerValue.includes("top")
          ? FlipCorner.TOP
          : FlipCorner.BOTTOM;

        const area = FlipCalculation.getFrontClipArea({
          ...intersectPoints,
          corner: topBottomCorner,
          pageHeight,
          pageWidth,
        });

        return FlipCalculation.getSoftCss({
          position: pos,
          pageWidth,
          pageHeight,
          area,
          direction: directionValue,
          angle: 0,
          factorPosition: FlipCalculation.getBottomPagePosition(
            directionValue,
            pageWidth,
            isRtl
          ),
          isRtl,
        });
      }
    ),
  };
}

/**
 * Get styles for a soft (foldable) page
 */
function getSoftPageStyle(
  calc: Interpolation<ICalc | null>,
  corner: SpringValue<Corner>,
  direction: SpringValue<FlipDirection>,
  bookRect: PageRect,
  isFront: boolean,
  isRtl: boolean,
  progress: SpringValue<number>
) {
  const { pageWidth, height: pageHeight, width } = bookRect;
  return {
    clipPath: to([corner, direction, calc], (corner, direction, calc) => {
      if (corner === "none" || !calc || isFront) return "none";

      return getBackSoftClipPath({
        calc: calc as ICalc,
        corner: corner as Corner,
        pageWidth,
        pageHeight,
        direction: direction as FlipDirection,
        isRtl,
      });
    }),
    transformOrigin: "0px 0px",
    transform: to([calc, corner, direction], (calc, corner, direction) => {
      if (corner === "none" || !calc || isFront) return "none";

      const calcValue = calc as ICalc;
      const directionValue = direction as FlipDirection;

      const { angle, rect } = calcValue;
      const activePos = FlipCalculation.convertToGlobal(
        FlipCalculation.getActiveCorner(directionValue, rect, isRtl),
        directionValue,
        width,
        isRtl
      );

      if (!activePos) return "none";

      return `translate3d(${activePos.x}px, ${
        activePos.y
      }px, 0) rotate(${angle}rad)`;
    }),
    zIndex: to([corner, progress], (corner, progress) => {
      if (isFront) return 3;
      return corner !== "none" && (progress as number) > 0 ? 4 : 2;
    }),
  };
}

/**
 * Get the clip path for the back of a soft page
 */
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

/**
 * Get styles for a hard (non-foldable) page
 */
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
    // Fix: Better handling of display property to ensure both sides render correctly
    display: progress.to((p) => {
      // Show front when p < 50 for front side or p >= 50 for back side
      const showCondition = (isFront && p < 50) || (!isFront && p >= 50);
      // Using block/none instead of opacity for better performance
      return showCondition ? "block" : "none";
    }),
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
    zIndex: to([direction, progress], (dir, p) => {
      // Fix: Better z-index management for hard pages
      const progressValue = p as number;
      const dirValue = dir as FlipDirection;
      // Ensure proper stacking during flip
      const baseZ = isFront ? 3 : 2;
      // Pages being flipped need higher z-index
      const flipZ = progressValue > 0 && progressValue < 100 ? 2 : 0;
      // Front pages that have been flipped past halfway need to be on top
      const frontPastHalfZ = isFront && progressValue >= 50 ? 1 : 0;
      // Back pages that haven't been flipped halfway yet need to be above
      const backBeforeHalfZ = !isFront && progressValue < 50 ? 1 : 0;

      return baseZ + flipZ + frontPastHalfZ + backBeforeHalfZ;
    }),
    // Fix: Add will-change for performance optimization
    willChange: progress.to((p) => (p > 0 && p < 100 ? "transform" : "auto")),
  };
}

/**
 * Calculate transform for hard pages during animation
 * Fixed to properly handle both front and back faces
 */
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
