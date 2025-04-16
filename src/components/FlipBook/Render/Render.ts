import { PageFlip } from "../PageFlip";
import { Point, PageRect, RectPoints } from "../BasicTypes";
import { FlipDirection } from "../Flip/Flip";
import { PageOrientation } from "../Page/Page";
import { FlipSetting, SizeType } from "../settings";
import { HTMLPage } from "../Page/HTMLPage";

type FrameAction = () => void;
type AnimationSuccessAction = () => void;

type Shadow = {
  pos: Point;
  angle: number;
  width: number;
  opacity: number;
  direction: FlipDirection;
  progress: number;
};

type AnimationProcess = {
  /** List of frames in playback order. Each frame is a function. */
  frames: FrameAction[];
  /** Total animation duration */
  duration: number;
  /** Animation duration of one frame */
  durationFrame: number;
  /** Сallback at the end of the animation */
  onAnimateEnd: AnimationSuccessAction;
  /** Animation start time (Global Timer) */
  startedAt: number;
};

export const Orientation = {
  PORTRAIT: 1,
  LANDSCAPE: 2,
} as const;

export type Orientation = (typeof Orientation)[keyof typeof Orientation];

export abstract class Render {
  protected readonly setting: FlipSetting;
  protected readonly app: PageFlip;
  protected leftPage!: HTMLPage | null;
  protected rightPage!: HTMLPage | null;
  protected flippingPage!: HTMLPage | null;
  protected bottomPage!: HTMLPage | null;
  protected direction!: FlipDirection;
  protected orientation!: Orientation;
  protected rtl: boolean = false;
  protected shadow: Shadow | null = null;
  protected animation: AnimationProcess | null = null;
  protected pageRect!: RectPoints;
  private boundsRect!: PageRect;
  protected timer = 0;

  protected constructor(app: PageFlip, setting: FlipSetting) {
    this.setting = setting;
    this.app = app;
  }

  protected abstract drawFrame(): void;

  public abstract reload(): void;

  private render(timer: number): void {
    if (this.animation !== null) {
      // Find current frame of animation
      const frameIndex = Math.round(
        (timer - this.animation.startedAt) / this.animation.durationFrame
      );

      if (frameIndex < this.animation.frames.length) {
        this.animation.frames[frameIndex]();
      } else {
        this.animation.onAnimateEnd();
        this.animation = null;
      }
    }

    this.timer = timer;
    this.drawFrame();
  }

  public start(): void {
    this.update();

    const loop = (timer: number): void => {
      this.render(timer);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  public startAnimation(
    frames: FrameAction[],
    duration: number,
    onAnimateEnd: AnimationSuccessAction
  ): void {
    this.finishAnimation(); // finish the previous animation process

    this.animation = {
      frames,
      duration,
      durationFrame: duration / frames.length,
      onAnimateEnd,
      startedAt: this.timer,
    };
  }

  public finishAnimation(): void {
    if (this.animation !== null) {
      this.animation.frames[this.animation.frames.length - 1]();

      if (this.animation.onAnimateEnd !== null) {
        this.animation.onAnimateEnd();
      }
    }

    this.animation = null;
  }

  public update(): void {
    const orientation = this.calculateBoundsRect();
    const rtl = this.app.getSettings().rtl;

    if (this.orientation !== orientation) {
      this.orientation = orientation;
      this.app.updateOrientation(orientation);
    }

    if (this.rtl !== rtl) {
      this.rtl = rtl;
      this.app.updateRTL(rtl);
    }
  }

  private calculateBoundsRect(): Orientation {
    let orientation: Orientation = Orientation.LANDSCAPE;

    const blockWidth = this.getBlockWidth();
    const middlePoint: Point = {
      x: blockWidth / 2,
      y: this.getBlockHeight() / 2,
    };

    const ratio = this.setting.width / this.setting.height;

    let pageWidth = this.setting.width;
    let pageHeight = this.setting.height;

    let left = middlePoint.x - pageWidth;

    if (this.setting.size === SizeType.STRETCH) {
      if (
        blockWidth < this.setting.minWidth * 2 &&
        this.app.getSettings().usePortrait
      )
        orientation = Orientation.PORTRAIT;

      pageWidth =
        orientation === Orientation.PORTRAIT
          ? this.getBlockWidth()
          : this.getBlockWidth() / 2;

      if (pageWidth > this.setting.maxWidth) pageWidth = this.setting.maxWidth;

      pageHeight = pageWidth / ratio;
      if (pageHeight > this.getBlockHeight()) {
        pageHeight = this.getBlockHeight();
        pageWidth = pageHeight * ratio;
      }

      left =
        orientation === Orientation.PORTRAIT
          ? middlePoint.x - pageWidth / 2 - pageWidth
          : middlePoint.x - pageWidth;
    } else {
      if (blockWidth < pageWidth * 2) {
        if (this.app.getSettings().usePortrait) {
          orientation = Orientation.PORTRAIT;
          left = middlePoint.x - pageWidth / 2 - pageWidth;
        }
      }
    }

    this.boundsRect = {
      left,
      top: middlePoint.y - pageHeight / 2,
      width: pageWidth * 2,
      height: pageHeight,
      pageWidth: pageWidth,
    };

    return orientation;
  }

  public setShadowData(
    pos: Point,
    angle: number,
    progress: number,
    direction: FlipDirection
  ): void {
    if (!this.app.getSettings().drawShadow) return;

    const maxShadowOpacity = 100 * this.getSettings().maxShadowOpacity;

    this.shadow = {
      pos,
      angle,
      width: (((this.getRect().pageWidth * 3) / 4) * progress) / 100,
      opacity: ((100 - progress) * maxShadowOpacity) / 100 / 100,
      direction,
      progress: progress * 2,
    };
  }

  public clearShadow(): void {
    this.shadow = null;
  }

  public getBlockWidth(): number {
    return this.app.getUI().getDistElement().offsetWidth;
  }

  public getBlockHeight(): number {
    return this.app.getUI().getDistElement().offsetHeight;
  }

  public getDirection(): FlipDirection {
    return this.direction;
  }

  public getRect(): PageRect {
    if (this.boundsRect === null) this.calculateBoundsRect();

    return this.boundsRect;
  }

  public getSettings(): FlipSetting {
    return this.app.getSettings();
  }

  public getOrientation(): Orientation {
    return this.orientation;
  }

  public setPageRect(pageRect: RectPoints): void {
    this.pageRect = pageRect;
  }

  public setDirection(direction: FlipDirection): void {
    this.direction = direction;
  }

  public setRightPage(page: HTMLPage | null): void {
    if (page !== null) page.setOrientation(PageOrientation.RIGHT);

    this.rightPage = page;
  }

  public setLeftPage(page: HTMLPage | null): void {
    if (page !== null) page.setOrientation(PageOrientation.LEFT);

    this.leftPage = page;
  }

  public setBottomPage(page: HTMLPage | null): void {
    if (page !== null)
      page.setOrientation(
        this.direction === FlipDirection.BACK
          ? PageOrientation.LEFT
          : PageOrientation.RIGHT
      );

    this.bottomPage = page;
  }

  public setFlippingPage(page: HTMLPage | null): void {
    if (page !== null)
      page.setOrientation(
        this.direction === FlipDirection.FORWARD &&
          this.orientation !== Orientation.PORTRAIT
          ? PageOrientation.LEFT
          : PageOrientation.RIGHT
      );

    this.flippingPage = page;
  }

  public convertToBook(pos: Point): Point {
    const rect = this.getRect();

    return {
      x: pos.x - rect.left,
      y: pos.y - rect.top,
    };
  }

  public convertToPage(pos: Point, direction?: FlipDirection): Point {
    if (!direction) direction = this.direction;

    const rect = this.getRect();
    const x =
      direction === FlipDirection.FORWARD
        ? pos.x - rect.left - rect.width / 2
        : rect.width / 2 - pos.x + rect.left;

    return {
      x,
      y: pos.y - rect.top,
    };
  }
  public getRTL(): boolean {
    return this.rtl;
  }

  public convertToGlobal(pos: Point, direction?: FlipDirection): Point {
    if (!direction) direction = this.direction;

    const rect = this.getRect();

    const x =
      direction === FlipDirection.FORWARD
        ? pos.x + rect.left + rect.width / 2
        : rect.width / 2 - pos.x + rect.left;

    return {
      x,
      y: pos.y + rect.top,
    };
  }
}
