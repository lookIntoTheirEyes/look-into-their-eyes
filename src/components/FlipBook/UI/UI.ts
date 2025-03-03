import { PageFlip } from "../PageFlip";
import { Point } from "../BasicTypes";
import { FlipSetting, SizeType } from "../Settings";
import { FlipCorner, FlippingState } from "../Flip/Flip";
import { Orientation } from "../Render/Render";

type SwipeData = {
  point: Point;
  time: number;
};

export abstract class UI {
  protected readonly parentElement: HTMLElement;
  protected readonly app: PageFlip;
  protected readonly wrapper: HTMLElement;
  protected distElement!: HTMLElement;
  private touchPoint: SwipeData | null = null;
  private readonly swipeTimeout = 250;
  private readonly swipeDistance: number;
  private onResize = (): void => {
    this.update();
  };

  protected constructor(
    inBlock: HTMLElement,
    app: PageFlip,
    setting: FlipSetting
  ) {
    this.parentElement = inBlock;

    inBlock.classList.add("stf__parent");
    // Add first wrapper
    inBlock.insertAdjacentHTML(
      "afterbegin",
      '<div class="stf__wrapper"></div>'
    );

    this.wrapper = inBlock.querySelector(".stf__wrapper")!;

    this.app = app;

    const k = this.app.getSettings().usePortrait ? 1 : 2;

    // Setting block sizes based on configuration
    inBlock.style.minWidth = setting.minWidth * k + "px";
    inBlock.style.minHeight = setting.minHeight + "px";

    if (setting.size === SizeType.FIXED) {
      inBlock.style.minWidth = setting.width * k + "px";
      inBlock.style.minHeight = setting.height + "px";
    }

    if (setting.autoSize) {
      inBlock.style.width = "100%";
      inBlock.style.maxWidth = setting.maxWidth * 2 + "px";
    }

    inBlock.style.display = "block";

    window.addEventListener("resize", this.onResize, false);
    this.swipeDistance = setting.swipeDistance;
  }

  public destroy(): void {
    if (this.app.getSettings().useMouseEvents) this.removeHandlers();

    this.distElement.remove();
    this.wrapper.remove();
  }

  public abstract update(): void;

  public getDistElement(): HTMLElement {
    return this.distElement;
  }

  public getWrapper(): HTMLElement {
    return this.wrapper;
  }

  public setOrientationStyle(orientation: Orientation): void {
    this.wrapper.classList.remove("--portrait", "--landscape");

    if (orientation === Orientation.PORTRAIT) {
      if (this.app.getSettings().autoSize)
        this.wrapper.style.paddingBottom =
          (this.app.getSettings().height / this.app.getSettings().width) * 100 +
          "%";

      this.wrapper.classList.add("--portrait");
    } else {
      if (this.app.getSettings().autoSize)
        this.wrapper.style.paddingBottom =
          (this.app.getSettings().height / (this.app.getSettings().width * 2)) *
            100 +
          "%";

      this.wrapper.classList.add("--landscape");
    }

    this.update();
  }

  protected removeHandlers(): void {
    window.removeEventListener("resize", this.onResize);

    this.distElement.removeEventListener("mousedown", this.onMouseDown);
    this.distElement.removeEventListener("touchstart", this.onTouchStart);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("touchmove", this.onTouchMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("touchend", this.onTouchEnd);
  }

  protected setHandlers(): void {
    window.addEventListener("resize", this.onResize, false);
    if (!this.app.getSettings().useMouseEvents) return;

    this.distElement.addEventListener("mousedown", this.onMouseDown);
    this.distElement.addEventListener("touchstart", this.onTouchStart, {
      passive: true,
    });
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("touchmove", this.onTouchMove, {
      passive: !this.app.getSettings().mobileScrollSupport,
    });
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("touchend", this.onTouchEnd);
  }

  private getMousePos(x: number, y: number): Point {
    const rect = this.distElement.getBoundingClientRect();

    return {
      x: this.app.getSettings().rtl
        ? rect.width - (x - rect.left)
        : x - rect.left,
      y: y - rect.top,
    };
  }

  public setRTLStyle(rtl: boolean): void {
    this.wrapper.classList.remove("--rtl");

    if (rtl) {
      this.wrapper.classList.add("--rtl");
    }

    this.update();
  }

  public isWithinBounds = (e: TouchEvent | MouseEvent) => {
    const rect = this.distElement.getBoundingClientRect();
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;

    const isInBounds =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!isInBounds) {
      return false;
    }

    const target = "touches" in e ? e.touches[0].target : e.target;
    if (!(target instanceof Element)) return false;

    let currentElement: Element | null = target;
    while (currentElement) {
      if (currentElement === this.distElement) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  };

  private checkTarget(targer: EventTarget): boolean {
    if (!this.app.getSettings().clickEventForward) return true;

    if (
      ["a", "button"].includes((targer as HTMLElement).tagName.toLowerCase())
    ) {
      return false;
    }

    return true;
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (this.checkTarget(e.target!)) {
      const pos = this.getMousePos(e.clientX, e.clientY);

      this.app.startUserTouch(pos);

      e.preventDefault();
    }
  };

  private onTouchStart = (e: TouchEvent): void => {
    if (this.checkTarget(e.target!)) {
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const pos = this.getMousePos(t.clientX, t.clientY);

        this.touchPoint = {
          point: pos,
          time: Date.now(),
        };

        // part of swipe detection
        setTimeout(() => {
          if (this.touchPoint !== null) {
            this.app.startUserTouch(pos);
          }
        }, this.swipeTimeout);

        if (!this.app.getSettings().mobileScrollSupport) e.preventDefault();
      }
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    const pos = this.getMousePos(e.clientX, e.clientY);

    this.app.userStop(pos);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.isWithinBounds(e)) {
      e.preventDefault();
    }
    const pos = this.getMousePos(e.clientX, e.clientY);

    this.app.userMove(pos, false);
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (this.isWithinBounds(e)) {
      e.preventDefault();
    }
    if (e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      const pos = this.getMousePos(t.clientX, t.clientY);

      if (this.app.getSettings().mobileScrollSupport) {
        if (this.touchPoint !== null) {
          if (
            Math.abs(this.touchPoint.point.x - pos.x) > 10 ||
            this.app.getState() !== FlippingState.READ
          ) {
            if (e.cancelable) this.app.userMove(pos, true);
          }
        }

        if (this.app.getState() !== FlippingState.READ) {
          e.preventDefault();
        }
      } else {
        this.app.userMove(pos, true);
      }
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      const pos = this.getMousePos(t.clientX, t.clientY);
      let isSwipe = false;

      // swipe detection
      if (this.touchPoint !== null) {
        const dx = pos.x - this.touchPoint.point.x;
        const distY = Math.abs(pos.y - this.touchPoint.point.y);

        if (
          Math.abs(dx) > this.swipeDistance &&
          distY < this.swipeDistance * 2 &&
          Date.now() - this.touchPoint.time < this.swipeTimeout
        ) {
          if (dx > 0) {
            this.app.flipPrev(
              this.touchPoint.point.y <
                this.app.getRender().getRect().height / 2
                ? FlipCorner.TOP
                : FlipCorner.BOTTOM
            );
          } else {
            this.app.flipNext(
              this.touchPoint.point.y <
                this.app.getRender().getRect().height / 2
                ? FlipCorner.TOP
                : FlipCorner.BOTTOM
            );
          }
          isSwipe = true;
        }

        this.touchPoint = null;
      }

      this.app.userStop(pos, isSwipe);
    }
  };
}
