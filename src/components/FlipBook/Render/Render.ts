import { PageFlip } from "../PageFlip";
import { Point, PageRect, RectPoints } from "../BasicTypes";
import { FlipDirection } from "../Flip/Flip";
import { PageOrientation } from "../Page/Page";
import { FlipSetting, SizeType } from "../Settings";
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
  frames: FrameAction[];
  duration: number;
  durationFrame: number;
  onAnimateEnd: AnimationSuccessAction;
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
  private animationFrameId: number | null = null;
  private needRender: boolean = false;
  private isDestroyed: boolean = false;
  private needRecalculateBounds: boolean = true;

  protected constructor(app: PageFlip, setting: FlipSetting) {
    if (!app || !setting) {
      throw new Error("Invalid constructor parameters");
    }
    this.setting = setting;
    this.app = app;
    this.render = this.render.bind(this);
  }

  protected abstract drawFrame(): void;

  public abstract reload(): void;

  private render(time: number): void {
    if (this.isDestroyed) return;

    this.timer = time;
    let needNext = false;

    if (this.animation !== null) {
      try {
        const frameIndex = Math.min(
          Math.floor(
            (time - this.animation.startedAt) / this.animation.durationFrame
          ),
          this.animation.frames.length - 1
        );

        this.animation.frames[frameIndex]();

        if (time >= this.animation.startedAt + this.animation.duration) {
          const onEnd = this.animation.onAnimateEnd;
          this.animation = null;
          this.needRender = true;
          onEnd();
        } else {
          needNext = true;
        }
      } catch (error) {
        console.error("Animation error:", error);
        this.animation = null;
      }
    }

    if (this.needRender) {
      try {
        this.drawFrame();
      } catch (error) {
        console.error("Render error:", error);
      }
      this.needRender = false;
      needNext = true;
    }

    if (needNext) {
      this.animationFrameId = requestAnimationFrame(this.render);
    } else {
      this.animationFrameId = null;
    }
  }

  private startRenderLoop(): void {
    if (this.isDestroyed) return;

    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame(this.render);
    }
  }

  public start(): void {
    if (this.isDestroyed) return;

    this.update();
    this.needRender = true;
    this.startRenderLoop();
  }

  public startAnimation(
    frames: FrameAction[],
    duration: number,
    onAnimateEnd: AnimationSuccessAction
  ): void {
    if (this.isDestroyed) return;

    if (!frames?.length || duration <= 0 || !onAnimateEnd) {
      console.warn("Invalid animation parameters");
      return;
    }

    this.finishAnimation();

    this.animation = {
      frames,
      duration,
      durationFrame: duration / frames.length,
      onAnimateEnd,
      startedAt: this.timer,
    };

    this.startRenderLoop();
  }

  public finishAnimation(): void {
    if (this.animation !== null) {
      try {
        this.animation.frames[this.animation.frames.length - 1]();
        this.animation.onAnimateEnd();
      } catch (error) {
        console.error("Error finishing animation:", error);
      }
    }
    this.animation = null;
    this.needRender = true;
    this.startRenderLoop();
  }

  public update(): void {
    if (this.isDestroyed) return;

    const orientation = this.calculateBoundsRect();
    const rtl = this.app.getSettings().rtl;

    if (this.orientation !== orientation) {
      this.orientation = orientation;
      this.app.updateOrientation(orientation);
      this.needRender = true;
      this.needRecalculateBounds = true;
    }

    if (this.rtl !== rtl) {
      this.rtl = rtl;
      this.app.updateRTL(rtl);
      this.needRender = true;
    }

    if (this.needRender) {
      this.startRenderLoop();
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
      ) {
        orientation = Orientation.PORTRAIT;
      }

      pageWidth =
        orientation === Orientation.PORTRAIT
          ? this.getBlockWidth()
          : this.getBlockWidth() / 2;

      if (pageWidth > this.setting.maxWidth) {
        pageWidth = this.setting.maxWidth;
      }

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
      pageWidth,
    };

    return orientation;
  }

  public setShadowData(
    pos: Point,
    angle: number,
    progress: number,
    direction: FlipDirection
  ): void {
    if (this.isDestroyed) return;

    if (!pos || typeof angle !== "number" || typeof progress !== "number") {
      console.warn("Invalid shadow parameters");
      return;
    }

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

    this.needRender = true;
    this.startRenderLoop();
  }

  public clearShadow(): void {
    this.shadow = null;
    this.needRender = true;
    this.startRenderLoop();
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
    if (!this.boundsRect || this.needRecalculateBounds) {
      this.calculateBoundsRect();
      this.needRecalculateBounds = false;
    }
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
    this.needRender = true;
    this.startRenderLoop();
  }

  public setDirection(direction: FlipDirection): void {
    this.direction = direction;
  }

  public setRightPage(page: HTMLPage | null): void {
    if (page !== null) page.setOrientation(PageOrientation.RIGHT);
    this.rightPage = page;
    this.needRender = true;
    this.startRenderLoop();
  }

  public setLeftPage(page: HTMLPage | null): void {
    if (page !== null) page.setOrientation(PageOrientation.LEFT);
    this.leftPage = page;
    this.needRender = true;
    this.startRenderLoop();
  }

  public setBottomPage(page: HTMLPage | null): void {
    if (page !== null) {
      page.setOrientation(
        this.direction === FlipDirection.BACK
          ? PageOrientation.LEFT
          : PageOrientation.RIGHT
      );
    }
    this.bottomPage = page;
    this.needRender = true;
    this.startRenderLoop();
  }

  public setFlippingPage(page: HTMLPage | null): void {
    if (page !== null) {
      page.setOrientation(
        this.direction === FlipDirection.FORWARD &&
          this.orientation !== Orientation.PORTRAIT
          ? PageOrientation.LEFT
          : PageOrientation.RIGHT
      );
    }
    this.flippingPage = page;
    this.needRender = true;
    this.startRenderLoop();
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

  public destroy(): void {
    this.isDestroyed = true;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.animation = null;
    this.shadow = null;
    this.leftPage = null;
    this.rightPage = null;
    this.flippingPage = null;
    this.bottomPage = null;
    this.needRender = false;
    this.needRecalculateBounds = true;
    this.boundsRect = null!;
    this.pageRect = null!;
  }
}
