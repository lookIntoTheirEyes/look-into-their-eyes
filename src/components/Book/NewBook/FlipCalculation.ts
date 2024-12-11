import { RefObject } from "react";
import Helper from "./Helper";
import {
  Point,
  Rect,
  RectPoints,
  FlipDirection,
  FlipCorner,
  Corner,
} from "./model";

/**
 * Class representing mathematical methods for calculating page position (rotation angle, clip area ...)
 */

function getFlippingProgress(
  px: number,
  isRightPage: boolean,
  bookLeft: number,
  bookWidth: number
) {
  let progress;

  if (isRightPage) {
    const maxProgress = bookLeft + bookWidth;
    progress = ((maxProgress - px) / bookWidth) * 100;
  } else {
    progress = ((px - bookLeft) / bookWidth) * 100;
  }

  return Math.min(100, Math.max(0, progress));
}

function getAngle(direction: FlipDirection, progress: number) {
  return (
    ((direction === FlipDirection.FORWARD ? 90 : -90) * (200 - progress * 2)) /
    100
  );
}

function getRotatedPoint(
  transformedPoint: Point,
  startPoint: Point,
  angle: number
): Point {
  const adjustedTransformedPoint = Helper.handleNull(transformedPoint);
  const adjustedStartPoint = Helper.handleNull(startPoint);

  return {
    x:
      adjustedTransformedPoint.x * Math.cos(angle) +
      adjustedTransformedPoint.y * Math.sin(angle) +
      adjustedStartPoint.x,
    y:
      adjustedTransformedPoint.y * Math.cos(angle) -
      adjustedTransformedPoint.x * Math.sin(angle) +
      adjustedStartPoint.y,
  };
}

function calculateAngle(
  origPos: Point,
  pageWidth: number,
  pageHeight: number,
  corner: FlipCorner
): number {
  const pos = Helper.handleNull(origPos);
  const left = pageWidth - pos.x + 1;
  const top = corner === FlipCorner.BOTTOM ? pageHeight - pos.y : pos.y;

  let angle = 2 * Math.acos(left / Math.sqrt(top * top + left * left));

  if (top < 0) angle = -angle;

  const da = Math.PI - angle;
  if (!isFinite(angle) || (da >= 0 && da < 0.003))
    throw new Error("The G point is too small");

  if (corner === FlipCorner.BOTTOM) angle = -angle;

  return angle;
}

function getRectFromBasePoint(
  points: Point[],
  localPos: Point,
  angle: number
): RectPoints {
  return {
    topLeft: getRotatedPoint(points[0], localPos, angle),
    topRight: getRotatedPoint(points[1], localPos, angle),
    bottomLeft: getRotatedPoint(points[2], localPos, angle),
    bottomRight: getRotatedPoint(points[3], localPos, angle),
  };
}

function getPageRect(
  localPos: Point,
  pageWidth: number,
  pageHeight: number,
  corner: FlipCorner,
  angle: number
): RectPoints {
  if (corner === FlipCorner.TOP) {
    return getRectFromBasePoint(
      [
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
        { x: 0, y: pageHeight },
        { x: pageWidth, y: pageHeight },
      ],
      localPos,
      angle
    );
  }

  return getRectFromBasePoint(
    [
      { x: 0, y: -pageHeight },
      { x: pageWidth, y: -pageHeight },
      { x: 0, y: 0 },
      { x: pageWidth, y: 0 },
    ],
    localPos,
    angle
  );
}

function getAngleAndGeometry(
  pos: Point,
  pageWidth: number,
  pageHeight: number,
  corner: FlipCorner
) {
  // console.log("updateAngleAndGeometry", pos);

  const angle = calculateAngle(pos, pageWidth, pageHeight, corner);
  const rect = getPageRect(pos, pageWidth, pageHeight, corner, angle);
  return { angle, rect };
}

function convertToPage(
  origPos: Point,
  direction: FlipDirection,
  bookRef: RefObject<HTMLDivElement>
): Point {
  const pos = Helper.handleNull(origPos);

  const rect = bookRef.current!.getBoundingClientRect();

  const x =
    direction === FlipDirection.FORWARD
      ? pos.x - rect.left - rect.width / 2
      : rect.width / 2 - pos.x + rect.left;

  const res = {
    x,
    y: pos.y - rect.top,
  };

  return res;
}

function calculateIntersectPoint(
  pos: Point,
  pageWidth: number,
  pageHeight: number,
  corner: Corner,
  rect: RectPoints
) {
  const boundRect: Rect = {
    left: -1,
    top: -1,
    width: pageWidth + 2,
    height: pageHeight + 2,
  };

  if (corner === "top-left" || corner === "top-right") {
    const topIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
      boundRect,
      [pos, rect.topRight],
      [
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
      ]
    );

    const sideIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
      boundRect,
      [pos, rect.bottomLeft],
      [
        { x: pageWidth, y: 0 },
        { x: pageWidth, y: pageHeight },
      ]
    );

    const bottomIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
      boundRect,
      [rect.bottomLeft, rect.bottomRight],
      [
        { x: 0, y: pageHeight },
        { x: pageWidth, y: pageHeight },
      ]
    );
    return {
      topIntersectPoint,
      bottomIntersectPoint,
      sideIntersectPoint,
    };
  } else {
    const topIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
      boundRect,
      [rect.topLeft, rect.topRight],
      [
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
      ]
    );

    const sideIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
      boundRect,
      [pos, rect.topLeft],
      [
        { x: pageWidth, y: 0 },
        { x: pageWidth, y: pageHeight },
      ]
    );

    const bottomIntersectPoint = Helper.GetIntersectBetweenTwoSegment(
      boundRect,
      [rect.bottomLeft, rect.bottomRight],
      [
        { x: 0, y: pageHeight },
        { x: pageWidth, y: pageHeight },
      ]
    );
    return { topIntersectPoint, bottomIntersectPoint, sideIntersectPoint };
  }
}

const FlipCalculation = {
  getFlippingProgress,
  getAngle,
  getRotatedPoint,
  calculateAngle,
  convertToPage,
  getAngleAndGeometry,
  calculateIntersectPoint,
};
export default FlipCalculation;
