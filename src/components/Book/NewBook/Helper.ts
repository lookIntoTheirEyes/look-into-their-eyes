import { Orientation } from "@/lib/model/book";
import { FlipDirection, Point, Rect, Segment } from "./model";
import { BookStyle } from "./useBookStyle";

/**
 * A class containing helping mathematical methods
 */

/**
 * Get the distance between two points
 *
 * @param {Point} point1
 * @param {Point} point2
 */
function GetDistanceBetweenTwoPoint(point1: Point, point2: Point): number {
  if (point1 === null || point2 === null) {
    return Infinity;
  }

  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
}

/**
 * Get the length of the line segment
 *
 * @param {Segment} segment
 */
function GetSegmentLength(segment: Segment): number {
  return GetDistanceBetweenTwoPoint(segment[0], segment[1]);
}

/**
 * Get the angle between two lines
 *
 * @param {Segment} line1
 * @param {Segment} line2
 */
function GetAngleBetweenTwoLine(line1: Segment, line2: Segment): number {
  const adjustedLine10 = handleNull(line1[0]);
  const adjustedLine20 = handleNull(line2[0]);
  const adjustedLine11 = handleNull(line1[1]);
  const adjustedLine21 = handleNull(line2[1]);
  const A1 = adjustedLine10.y - adjustedLine11.y;
  const A2 = adjustedLine20.y - adjustedLine21.y;

  const B1 = adjustedLine11.x - adjustedLine10.x;
  const B2 = adjustedLine21.x - adjustedLine20.x;

  return Math.acos(
    (A1 * A2 + B1 * B2) /
      (Math.sqrt(A1 * A1 + B1 * B1) * Math.sqrt(A2 * A2 + B2 * B2))
  );
}

/**
 * Check for a point in a rectangle
 *
 * @param {Rect} rect
 * @param {Point} pos
 *
 * @returns {Point} If the point enters the rectangle its coordinates will be returned, otherwise - null
 */
function PointInRect(rect: Rect, pos: Point | null): Point | null {
  if (!pos) {
    return null;
  }

  if (
    pos.x >= rect.left &&
    pos.x <= rect.width + rect.left &&
    pos.y >= rect.top &&
    pos.y <= rect.top + rect.height
  ) {
    return pos;
  }
  return null;
}

/**
 * Transform point coordinates to a given angle
 *
 * @param {Point} transformedPoint - Point to rotate
 * @param {Point} startPoint - Transformation reference point
 * @param {number} angle - Rotation angle (in radians)
 *
 * @returns {Point} Point coordinates after rotation
 */
function GetRotatedPoint(
  transformedPoint: Point,
  startPoint: Point,
  angle: number
): Point {
  const adjustedTransformedPoint = handleNull(transformedPoint);
  const adjustedStartPoint = handleNull(startPoint);

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

/**
 * Limit a point "linePoint" to a given circle centered at point "startPoint" and a given radius
 *
 * @param {Point} startPoint - Circle center
 * @param {number} radius - Circle radius
 * @param {Point} limitedPoint - Сhecked point
 *
 * @returns {Point} If "linePoint" enters the circle, then its coordinates are returned.
 * Else will be returned the intersection point between the line ([startPoint, linePoint]) and the circle
 */
function LimitPointToCircle(
  startPoint: Point,
  radius: number,
  limitedPoint: Point
): Point {
  // If "linePoint" enters the circle, do nothing
  if (GetDistanceBetweenTwoPoint(startPoint, limitedPoint) <= radius) {
    return limitedPoint;
  }

  const adjustedStartPoint = handleNull(startPoint);
  const adjustedLimitedPoint = handleNull(limitedPoint);

  const a = adjustedStartPoint.x;
  const b = adjustedStartPoint.y;
  const n = adjustedLimitedPoint.x;
  const m = adjustedLimitedPoint.y;

  // Find the intersection between the line at two points: (startPoint and limitedPoint) and the circle.
  let x =
    Math.sqrt(
      (Math.pow(radius, 2) * Math.pow(a - n, 2)) /
        (Math.pow(a - n, 2) + Math.pow(b - m, 2))
    ) + a;
  if (adjustedLimitedPoint.x < 0) {
    x *= -1;
  }

  let y = ((x - a) * (b - m)) / (a - n) + b;
  if (a - n + b === 0) {
    y = radius;
  }

  return { x, y };
}

/**
 * Find the intersection of two lines bounded by a rectangle "rectBorder"
 *
 * @param {Rect} rectBorder
 * @param {Segment} one
 * @param {Segment} two
 *
 * @returns {Point} The intersection point, or "null" if it does not exist, or it lies outside the rectangle "rectBorder"
 */
function GetIntersectBetweenTwoSegment(
  rectBorder: Rect,
  one: Segment,
  two: Segment
): Point | null {
  return PointInRect(rectBorder, GetIntersectBetweenTwoLine(one, two));
}

/**
 * Find the intersection point of two lines
 *
 * @param one
 * @param two
 *
 * @returns {Point} The intersection point, or "null" if it does not exist
 * @throws Error if the segments are on the same line
 */
function GetIntersectBetweenTwoLine(one: Segment, two: Segment): Point | null {
  const segmentOne0 = handleNull(one[0]);
  const segmentTwo0 = handleNull(two[0]);
  const segmentOne1 = handleNull(one[1]);
  const segmentTwo1 = handleNull(two[1]);

  const A1 = segmentOne0.y - segmentOne1.y;
  const A2 = segmentTwo0.y - segmentTwo1.y;

  const B1 = segmentOne1.x - segmentOne0.x;
  const B2 = segmentTwo1.x - segmentTwo0.x;

  const C1 = segmentOne0.x * segmentOne1.y - segmentOne1.x * segmentOne0.y;
  const C2 = segmentTwo0.x * segmentTwo1.y - segmentTwo1.x * segmentTwo0.y;

  const det1 = A1 * C2 - A2 * C1;
  const det2 = B1 * C2 - B2 * C1;

  const x = -((C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1));
  const y = -((A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1));

  if (isFinite(x) && isFinite(y)) {
    return { x, y };
  } else {
    if (Math.abs(det1 - det2) < 0.1) throw new Error("Segment included");
  }

  return null;
}

/**
 * Get a list of coordinates (step: 1px) between two points
 *
 * @param pointOne
 * @param pointTwo
 *
 * @returns {Point[]}
 */
function GetCordsFromTwoPoint(pointOne: Point, pointTwo: Point): Point[] {
  const adjustedPointOne = handleNull(pointOne);
  const adjustedPointTwo = handleNull(pointTwo);
  const sizeX = Math.abs(adjustedPointOne.x - adjustedPointTwo.x);
  const sizeY = Math.abs(adjustedPointOne.y - adjustedPointTwo.y);

  const lengthLine = Math.max(sizeX, sizeY);

  const result: Point[] = [pointOne];

  function getCord(
    c1: number,
    c2: number,
    size: number,
    length: number,
    index: number
  ): number {
    if (c2 > c1) {
      return c1 + index * (size / length);
    } else if (c2 < c1) {
      return c1 - index * (size / length);
    }

    return c1;
  }

  for (let i = 1; i <= lengthLine; i += 1) {
    result.push({
      x: getCord(adjustedPointOne.x, adjustedPointTwo.x, sizeX, lengthLine, i),
      y: getCord(adjustedPointOne.y, adjustedPointTwo.y, sizeY, lengthLine, i),
    });
  }

  return result;
}
function handleNull(point: Point) {
  if (!point) {
    return { x: 0, y: 0 };
  }
  return point;
}

function getDirectionByPoint(
  touchPos: Point,
  { left, top, width, height, mode }: BookStyle,
  isRtl = false
): FlipDirection {
  const adjustedPos = handleNull(touchPos);

  const rect = { left, top, width, height, pageWidth: width / 2 };

  if (mode === Orientation.PORTRAIT) {
    if (adjustedPos.x - rect.pageWidth <= rect.width / 5) {
      return isRtl ? FlipDirection.FORWARD : FlipDirection.BACK;
    }
  } else if (adjustedPos.x < rect.width / 2) {
    return isRtl ? FlipDirection.FORWARD : FlipDirection.BACK;
  }

  return isRtl ? FlipDirection.BACK : FlipDirection.FORWARD;
}

export const isLeftPage = (x: number, bookStyle: BookStyle) => {
  const pageWidth = bookStyle.width / 2;
  return x >= bookStyle.left && x <= bookStyle.left + pageWidth;
};

const helper = {
  handleNull,
  GetCordsFromTwoPoint,
  GetDistanceBetweenTwoPoint,
  PointInRect,
  GetSegmentLength,
  GetIntersectBetweenTwoSegment,
  GetIntersectBetweenTwoLine,
  GetRotatedPoint,
  GetAngleBetweenTwoLine,
  LimitPointToCircle,
  getDirectionByPoint,
  isLeftPage,
};

export default helper;
