export const SizeType = {
  FIXED: 1,
  STRETCH: 2,
} as const;

export type SizeType = (typeof SizeType)[keyof typeof SizeType];

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
}

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
  };

  public getSettings(
    userSetting: Record<string, number | string | boolean>
  ): FlipSetting {
    const result = this._default;
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
