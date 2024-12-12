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
  const angle = calculateAngle(pos, pageWidth, pageHeight, corner);
  const rect = getPageRect(pos, pageWidth, pageHeight, corner, angle);
  return { angle, rect };
}

function convertToPage(
  pos: Point,
  direction: FlipDirection,
  { left, width, top }: { left: number; width: number; top: number }
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
    pageWidth,
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

function checkPositionAtCenterLine(
  checkedPos: Point,
  centerOne: Point,
  centerTwo: Point,
  pageWidth: number,
  pageHeight: number,
  corner: FlipCorner,
  rect: RectPoints,
  angle: number
): { pos: Point; angle: number; rect: RectPoints } {
  let pos = checkedPos;

  const updatedValues = { angle, rect };

  const tmp = Helper.LimitPointToCircle(centerOne, pageWidth, pos);
  // console.log("checkPositionAtCenterLine", result === tmp);
  if (pos?.x !== tmp!.x || pos?.y !== tmp!.y) {
    pos = tmp;

    Object.assign(
      updatedValues,
      getAngleAndGeometry(pos, pageWidth, pageHeight, corner)
    );
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

    if (bottomPoint!.x !== pos!.x || bottomPoint!.y !== pos!.y) {
      pos = bottomPoint;
      Object.assign(
        updatedValues,
        getAngleAndGeometry(pos, pageWidth, pageHeight, corner)
      );
    }
  }

  return { pos, angle, rect };
}

function getAngleAndPosition(
  userPos: Point,
  pageWidth: number,
  pageHeight: number,
  corner: Corner
): { pos: Point; angle: number; rect: RectPoints } {
  const topBottomCorner = corner.includes("top")
    ? FlipCorner.TOP
    : FlipCorner.BOTTOM;
  const result = {
    pos: userPos,
    ...getAngleAndGeometry(userPos, pageWidth, pageHeight, topBottomCorner),
  };

  if (topBottomCorner === FlipCorner.TOP) {
    checkPositionAtCenterLine(
      result.pos,
      { x: 0, y: 0 },
      { x: 0, y: pageHeight },
      pageWidth,
      pageHeight,
      topBottomCorner,
      result.rect,
      result.angle
    );
  } else {
    checkPositionAtCenterLine(
      result.pos,
      { x: 0, y: pageHeight },
      { x: 0, y: 0 },
      pageWidth,
      pageHeight,
      topBottomCorner,
      result.rect,
      result.angle
    );
  }

  if (Math.abs(result.pos!.x - pageWidth) < 1 && Math.abs(result.pos!.y) < 1) {
    throw new Error("Point is too small");
  }

  return result;
}

function getBottomClipArea({
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
  corner: FlipCorner;
}): Point[] {
  const result = [];
  let clipBottom = false;

  result.push(rect.topLeft);
  result.push(topIntersectPoint);

  if (sideIntersectPoint === null) {
    clipBottom = true;
  } else {
    result.push(sideIntersectPoint);

    if (bottomIntersectPoint === null) clipBottom = false;
  }

  result.push(bottomIntersectPoint);

  if (clipBottom || corner === FlipCorner.BOTTOM) {
    result.push(rect.bottomLeft);
  }

  return result;
}
function getSoftCss({
  position,
  direction,
  pageHeight,
  pageWidth,
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
  // console.log("drawSoft", this.state);

  const commonStyle = `
            display: block;
            left: 0;
            top: 0;
            width: ${pageWidth}px;
            height: ${pageHeight}px;
        `;

  let polygon = "polygon( ";
  for (const p of area) {
    if (p !== null) {
      let g =
        direction === FlipDirection.BACK
          ? {
              x: -p.x + factorPosition!.x,
              y: p.y - factorPosition!.y,
            }
          : {
              x: p.x - factorPosition!.x,
              y: p.y - factorPosition!.y,
            };
      // console.log("g", g, this.state.angle);

      g = Helper.handleNull(Helper.GetRotatedPoint(g, { x: 0, y: 0 }, angle));
      polygon += g.x + "px " + g.y + "px, ";
    }
  }
  polygon = polygon.slice(0, -2);
  polygon += ")";

  // console.log("polygon", this.state.area, polygon);

  // const newStyle =
  //   commonStyle +
  //   `transform-origin: 0 0; clip-path: ${polygon}; ` +
  //   `transform: translate3d(${position!.x}px, ${
  //     position!.y
  //   }px, 0) rotate(${angle}rad);`;

  return polygon;
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

function getActiveCorner(direction: FlipDirection, rect: RectPoints): Point {
  if (direction === FlipDirection.FORWARD) {
    return rect.topLeft;
  }

  return rect.topRight;
}

const FlipCalculation = {
  getFlippingProgress,
  getAngle,
  getRotatedPoint,
  calculateAngle,
  convertToPage,
  getAngleAndGeometry,
  calculateIntersectPoint,
  checkPositionAtCenterLine,
  getAngleAndPosition,
  getFlippingClipArea,
  getBottomClipArea,
  getActiveCorner,
  getBottomPagePosition,
  getSoftCss,
};
export default FlipCalculation;
