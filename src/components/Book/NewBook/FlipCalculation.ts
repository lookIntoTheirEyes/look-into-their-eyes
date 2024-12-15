import Helper from "./Helper";
import {
  Point,
  Rect,
  RectPoints,
  FlipDirection,
  FlipCorner,
  Corner,
  PageRect,
} from "./model";

/**
 * Class representing mathematical methods for calculating page position (rotation angle, clip area ...)
 */

interface GeoParams {
  pos: Point;
  pageWidth: number;
  pageHeight: number;
  corner: FlipCorner;
}

interface AngleGeoParams extends GeoParams {
  angle: number;
}
interface RectGeoParams extends GeoParams {
  rect: RectPoints;
}

interface CalcResult {
  pos: Point;
  angle: number;
  rect: RectPoints;
}

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
  transformedPoint = Helper.handleNull(transformedPoint);
  startPoint = Helper.handleNull(startPoint);
  return {
    x:
      transformedPoint.x * Math.cos(angle) +
      transformedPoint.y * Math.sin(angle) +
      startPoint.x,
    y:
      transformedPoint.y * Math.cos(angle) -
      transformedPoint.x * Math.sin(angle) +
      startPoint.y,
  };
}

function calculateAngle({
  pos,
  pageHeight,
  pageWidth,
  corner,
}: GeoParams): number {
  // verified
  pos = Helper.handleNull(pos);
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
  // verified
  return {
    topLeft: getRotatedPoint(points[0], localPos, angle),
    topRight: getRotatedPoint(points[1], localPos, angle),
    bottomLeft: getRotatedPoint(points[2], localPos, angle),
    bottomRight: getRotatedPoint(points[3], localPos, angle),
  };
}

function getPageRect({
  pos,
  pageWidth,
  pageHeight,
  corner,
  angle,
}: AngleGeoParams): RectPoints {
  // verified
  if (corner === FlipCorner.TOP) {
    return getRectFromBasePoint(
      [
        { x: 0, y: 0 },
        { x: pageWidth, y: 0 },
        { x: 0, y: pageHeight },
        { x: pageWidth, y: pageHeight },
      ],
      pos,
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
    pos,
    angle
  );
}

function getAngleAndGeometry(params: GeoParams) {
  const angle = calculateAngle(params);
  const rect = getPageRect({ ...params, angle });

  return { angle, rect };
}

function convertToPage(
  pos: Point,
  direction: FlipDirection,
  { left, width, top }: Rect
): Point {
  pos = Helper.handleNull(pos);

  const x =
    direction === FlipDirection.FORWARD
      ? pos.x - left - width / 2
      : width / 2 - pos.x + left;

  const res = {
    x,
    y: pos.y - top,
  };

  return res;
}

function calculateIntersectPoint({
  pos,
  pageWidth,
  pageHeight,
  corner,
  rect,
}: RectGeoParams) {
  const boundRect: Rect = {
    left: -1,
    top: -1,
    width: pageWidth + 2,
    height: pageHeight + 2,
  };

  if (corner === FlipCorner.TOP) {
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

function checkPositionAtCenterLine({
  checkedPos,
  centerOne,
  centerTwo,
  rect,
  angle,
  pageWidth,
  pageHeight,
  corner,
}: {
  pageWidth: number;
  pageHeight: number;
  corner: FlipCorner;
  checkedPos: Point;
  centerOne: Point;
  centerTwo: Point;
  rect: RectPoints;
  angle: number;
}): { pos: Point; rect: RectPoints; angle: number } {
  let result = checkedPos;

  const tmp = Helper.LimitPointToCircle(centerOne, pageWidth, result);

  if (result?.x !== tmp?.x || result?.y !== tmp?.y) {
    result = tmp;
    const res = getAngleAndGeometry({
      pos: result,
      pageWidth,
      pageHeight,
      corner,
    });
    rect = res.rect;
    angle = res.angle;
  }

  const rad = Math.sqrt(Math.pow(pageWidth, 2) + Math.pow(pageHeight, 2));

  let checkPointOne = rect.bottomRight;
  let checkPointTwo = rect.topLeft;

  if (corner === FlipCorner.BOTTOM) {
    checkPointOne = rect.topRight;
    checkPointTwo = rect.bottomLeft;
  }

  if (checkPointOne!.x <= 0) {
    const bottomPoint = Helper.LimitPointToCircle(
      centerTwo,
      rad,
      checkPointTwo
    );

    if (bottomPoint?.x !== result?.x || bottomPoint?.y !== result?.y) {
      result = bottomPoint;
      const res = getAngleAndGeometry({
        pos: result,
        pageWidth,
        pageHeight,
        corner,
      });
      rect = res.rect;
      angle = res.angle;
    }
  }

  return { pos: result, rect, angle };
}

function getAnglePositionAndRect(
  userPos: Point,
  pageWidth: number,
  pageHeight: number,
  corner: string,
  direction: FlipDirection
): CalcResult {
  const topBottomCorner = corner.includes("top")
    ? FlipCorner.TOP
    : FlipCorner.BOTTOM;

  const initialCalc = calculateInitialPosition({
    userPos,
    pageWidth,
    pageHeight,
    topBottomCorner,
  });

  const checkedPosition = calculateCheckedPosition({
    initialCalc,
    pageWidth,
    pageHeight,
    topBottomCorner,
  });

  validatePosition(checkedPosition.pos, pageWidth);

  return {
    ...checkedPosition,
    angle:
      direction === FlipDirection.FORWARD
        ? -checkedPosition.angle
        : checkedPosition.angle,
  };
}

function calculateInitialPosition({
  userPos,
  pageWidth,
  pageHeight,
  topBottomCorner,
}: {
  userPos: Point;
  pageWidth: number;
  pageHeight: number;
  topBottomCorner: FlipCorner;
}): CalcResult {
  return {
    pos: userPos,
    ...getAngleAndGeometry({
      pos: userPos,
      pageWidth,
      pageHeight,
      corner: topBottomCorner,
    }),
  };
}

function calculateCheckedPosition({
  initialCalc,
  pageWidth,
  pageHeight,
  topBottomCorner,
}: {
  initialCalc: CalcResult;
  pageWidth: number;
  pageHeight: number;
  topBottomCorner: FlipCorner;
}): CalcResult {
  const common = {
    checkedPos: initialCalc.pos,
    rect: initialCalc.rect,
    angle: initialCalc.angle,
    pageWidth,
    pageHeight,
    corner: topBottomCorner,
  };

  return topBottomCorner === FlipCorner.TOP
    ? checkPositionAtCenterLine({
        centerOne: { x: 0, y: 0 },
        centerTwo: { x: 0, y: pageHeight },
        ...common,
      })
    : checkPositionAtCenterLine({
        centerOne: { x: 0, y: pageHeight },
        centerTwo: { x: 0, y: 0 },
        ...common,
      });
}

function validatePosition(pos: Point, pageWidth: number): void {
  if (Math.abs(pos!.x - pageWidth) < 1 && Math.abs(pos!.y) < 1) {
    throw new Error("Point is too small");
  }
}

function getFrontClipArea({
  topIntersectPoint,
  bottomIntersectPoint,
  sideIntersectPoint,
  pageHeight,
  pageWidth,
  corner,
}: {
  topIntersectPoint: Point;
  bottomIntersectPoint: Point;
  sideIntersectPoint: Point;
  pageWidth: number;
  pageHeight: number;
  corner: FlipCorner;
}): Point[] {
  const result = [];

  result.push(topIntersectPoint);

  if (corner === FlipCorner.TOP) {
    result.push({ x: pageWidth, y: 0 });
  } else {
    if (topIntersectPoint !== null) {
      result.push({ x: pageWidth, y: 0 });
    }
    result.push({ x: pageWidth, y: pageHeight });
  }

  if (sideIntersectPoint !== null) {
    if (
      Helper.GetDistanceBetweenTwoPoint(
        sideIntersectPoint,
        topIntersectPoint
      ) >= 10
    )
      result.push(sideIntersectPoint);
  } else {
    if (corner === FlipCorner.TOP) {
      result.push({ x: pageWidth, y: pageHeight });
    }
  }

  result.push(bottomIntersectPoint);
  result.push(topIntersectPoint);

  return result;
}

function getFlippingClipArea({
  topIntersectPoint,
  bottomIntersectPoint,
  sideIntersectPoint,
  rect,
  corner,
}: {
  topIntersectPoint: Point;
  bottomIntersectPoint: Point;
  sideIntersectPoint: Point;
  rect: RectPoints;
  corner: Corner;
}): Point[] {
  const result = [];
  let clipBottom = false;
  const topBottomCorner = corner.includes("top")
    ? FlipCorner.TOP
    : FlipCorner.BOTTOM;

  result.push(rect.topLeft);
  result.push(topIntersectPoint);

  if (sideIntersectPoint === null) {
    clipBottom = true;
  } else {
    result.push(sideIntersectPoint);

    if (bottomIntersectPoint === null) clipBottom = false;
  }

  result.push(bottomIntersectPoint);

  if (clipBottom || topBottomCorner === FlipCorner.BOTTOM) {
    result.push(rect.bottomLeft);
  }

  return result;
}
function getSoftCss({
  direction,
  angle,
  area,
  factorPosition,
}: {
  angle: number;
  position: Point;
  direction: FlipDirection;
  pageWidth: number;
  pageHeight: number;
  area: Point[];
  factorPosition: Point;
}): string {
  return `polygon(${area
    .filter((p) => p !== null)
    .map((p) => {
      const g =
        direction === FlipDirection.BACK
          ? {
              x: -p.x + factorPosition!.x,
              y: p.y - factorPosition!.y,
            }
          : {
              x: p.x - factorPosition!.x,
              y: p.y - factorPosition!.y,
            };

      const rotatedPoint = Helper.handleNull(
        Helper.GetRotatedPoint(g, { x: 0, y: 0 }, angle)
      );

      return `${rotatedPoint.x}px ${rotatedPoint.y}px`;
    })
    .join(", ")})`;
}

function getBottomPagePosition(
  direction: FlipDirection,
  pageWidth: number
): Point {
  if (direction === FlipDirection.BACK) {
    return { x: pageWidth, y: 0 };
  }

  return { x: 0, y: 0 };
}

function convertToGlobal(
  pos: Point,
  direction: FlipDirection,
  rect: PageRect
): Point {
  if (pos == null) return null;

  const x =
    direction === FlipDirection.FORWARD ? pos.x : rect.width / 2 - pos.x;

  return {
    x,
    y: pos.y,
  };
}

function getActiveCorner(direction: FlipDirection, rect: RectPoints): Point {
  if (direction === FlipDirection.FORWARD) {
    return rect.topLeft;
  }

  return rect.topRight;
}

const FlipCalculation = {
  getFlippingProgress,
  getAngle,
  convertToPage,
  getAngleAndGeometry,
  calculateIntersectPoint,
  checkPositionAtCenterLine,
  getAnglePositionAndRect,
  getFlippingClipArea,
  getFrontClipArea,
  getActiveCorner,
  getBottomPagePosition,
  getSoftCss,
  convertToGlobal,
};
export default FlipCalculation;
