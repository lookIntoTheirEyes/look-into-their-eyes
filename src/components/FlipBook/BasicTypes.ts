export interface Point {
  x: number;
  y: number;
}

export interface RectPoints {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PageRect {
  left: number;
  top: number;
  width: number;
  height: number;
  pageWidth: number;
}

export type Segment = [Point, Point];
