import { WidgetEvent } from "../Event/EventObject";
import { SizeType } from "../Settings";

export type PageState = "user_fold" | "fold_corner" | "flipping" | "read";
export type PageOrientation = "portrait" | "landscape";

export interface IFlipSetting {
  startPage: number;
  size: SizeType;
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  drawShadow?: boolean;
  flippingTime?: number;
  usePortrait?: boolean;
  startZIndex?: number;
  autoSize?: boolean;
  maxShadowOpacity?: number;
  showCover?: boolean;
  mobileScrollSupport?: boolean;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  rtl: boolean;
}

export interface IBookState {
  page: number;
  mode: PageOrientation;
}

export interface IEventProps {
  onFlip?: (flipEvent: WidgetEvent) => void;
}
