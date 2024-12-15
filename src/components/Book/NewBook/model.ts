export const FlipDirection = {
  FORWARD: "FORWARD",
  BACK: "BACK",
} as const;

export type FlipDirection = (typeof FlipDirection)[keyof typeof FlipDirection];

export const FlipCorner = {
  TOP: 1,
  BOTTOM: 2,
} as const;

export type FlipCorner = (typeof FlipCorner)[keyof typeof FlipCorner];

/**
 * Type representing a point on a plane
 */
interface IPoint {
  x: number;
  y: number;
}

export type Point = IPoint | null;
/**
 * Type representing a coordinates of the rectangle on the plane
 */
export interface RectPoints {
  /** Coordinates of the top left corner */
  topLeft: Point;
  /** Coordinates of the top right corner */
  topRight: Point;
  /** Coordinates of the bottom left corner */
  bottomLeft: Point;
  /** Coordinates of the bottom right corner */
  bottomRight: Point;
}

/**
 * Type representing a rectangle
 */
export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Type representing a book area
 */
export interface PageRect extends Rect {
  pageWidth: number;
}

/**
 * Type representing a line segment contains two points: start and end
 */
export type Segment = [Point, Point];

export type PageMouseLocation =
  | "leftPageLeft"
  | "leftPageRight"
  | "rightPageLeft"
  | "rightPageRight";

export type Corner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "none";
