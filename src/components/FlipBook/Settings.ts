import { WidgetEvent } from "./Event/EventObject";
import { PageFlip } from "./PageFlip";

// Size Type Definition
export const SizeType = {
  FIXED: 1,
  STRETCH: 2,
} as const;

export type SizeType = (typeof SizeType)[keyof typeof SizeType];

// Core FlipSetting interface used by the PageFlip component
export interface FlipSetting {
  startPage: number;
  size: SizeType;
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  drawShadow: boolean;
  flippingTime: number;
  usePortrait: boolean;
  startZIndex: number;
  autoSize: boolean;
  maxShadowOpacity: number;
  showCover: boolean;
  mobileScrollSupport: boolean;
  clickEventForward: boolean;
  useMouseEvents: boolean;
  swipeDistance: number;
  showPageCorners: boolean;
  rtl: boolean;

  // Touch handling parameters
  swipeVerticalTolerance: number;
  swipeDetectionTime: number;
  swipeDirectionThreshold: number;
}

// Props for the React component wrapper
export interface IFlipBookProps {
  // Basic book configuration
  startPage: number;
  size: SizeType | number;
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  rtl: boolean;

  // Optional configuration
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

  // Touch handling configuration
  swipeVerticalTolerance?: number;
  swipeDetectionTime?: number;
  swipeDirectionThreshold?: number;

  // Event handlers
  onFlip?: (event: WidgetEvent) => void;
  onChangeOrientation?: (event: WidgetEvent) => void;
  onInit?: (event: WidgetEvent) => void;

  // React components
  children?: React.ReactNode;
  controls: React.ReactNode;
  blankPage?: React.ReactElement;
}

// Type for the forwarded ref in React component
export interface FlipBookRef {
  pageFlip: () => PageFlip | null;
}

// Helper types for state representation
export type PageState = "user_fold" | "fold_corner" | "flipping" | "read";
export type PageOrientation = "portrait" | "landscape";

// Settings class for managing defaults and validation
export class Settings {
  private _default: FlipSetting = {
    startPage: 0,
    size: SizeType.FIXED,
    width: 0,
    height: 0,
    minWidth: 0,
    maxWidth: 0,
    minHeight: 0,
    maxHeight: 0,
    drawShadow: true,
    flippingTime: 700,
    usePortrait: true,
    startZIndex: 30,
    autoSize: true,
    maxShadowOpacity: 1,
    showCover: true,
    mobileScrollSupport: true,
    swipeDistance: 30,
    clickEventForward: true,
    useMouseEvents: true,
    showPageCorners: true,
    rtl: false,

    // Touch handling defaults
    swipeVerticalTolerance: 1.5, // Ratio of vertical to horizontal movement to be considered vertical
    swipeDetectionTime: 250, // Max time in ms for a swipe to be registered
    swipeDirectionThreshold: 10, // Minimum movement in pixels to determine scroll direction
  };

  public getSettings(
    userSetting: Record<string, number | string | boolean>
  ): FlipSetting {
    const result = { ...this._default };
    Object.assign(result, userSetting);

    if (result.size !== SizeType.STRETCH && result.size !== SizeType.FIXED)
      throw new Error(
        'Invalid size type. Available only "fixed" and "stretch" value'
      );

    if (result.width <= 0 || result.height <= 0)
      throw new Error("Invalid width or height");

    if (result.flippingTime <= 0) throw new Error("Invalid flipping time");

    if (result.size === SizeType.STRETCH) {
      if (result.minWidth <= 0) result.minWidth = 100;

      if (result.maxWidth < result.minWidth) result.maxWidth = 2000;

      if (result.minHeight <= 0) result.minHeight = 100;

      if (result.maxHeight < result.minHeight) result.maxHeight = 2000;
    } else {
      result.minWidth = result.width;
      result.maxWidth = result.width;
      result.minHeight = result.height;
      result.maxHeight = result.height;
    }

    return result;
  }
}
