import { BookStyle } from "./useBookStyle";

export const isLeftPage = (x: number, bookStyle: BookStyle) => {
  const pageWidth = bookStyle.width / 2;
  return x >= bookStyle.left && x <= bookStyle.left + pageWidth;
};

export const isTopCorner = (y: number, { top, height }: BookStyle) => {
  return top + y <= (top + height) / 2;
};
