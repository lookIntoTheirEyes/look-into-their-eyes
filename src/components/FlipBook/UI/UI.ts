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
  private readonly swipeVerticalTolerance: number;
  private readonly swipeDirectionThreshold: number;

  // Enhanced touch tracking
  private isScrolling: boolean = false;
  private initialTouchPoint: Point | null = null;
  private touchMoveCount: number = 0;
  private touchStartTime: number = 0;
  private primaryDirection: "horizontal" | "vertical" | null = null;

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

    // Set sensible defaults if not provided in settings
    this.swipeVerticalTolerance = setting.swipeVerticalTolerance || 1.3;
    this.swipeDirectionThreshold = setting.swipeDirectionThreshold || 10;
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

  /**
   * Checks if the event is within the bounds of the flipbook element
   */
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

  /**
   * Checks if the target element should be handled for flipping
   * or if it should use its default behavior (e.g., links, buttons)
   */
  private checkTarget(target: EventTarget): boolean {
    if (!this.app.getSettings().clickEventForward) return true;

    if (
      ["a", "button", "input", "select", "textarea"].includes(
        (target as HTMLElement).tagName.toLowerCase()
      )
    ) {
      return false;
    }

    // Check for common clickable classes
    const element = target as HTMLElement;
    if (
      element.getAttribute("role") === "button" ||
      element.classList.contains("clickable") ||
      element.classList.contains("btn") ||
      element.onclick
    ) {
      return false;
    }

    return true;
  }

  /**
   * Determines the primary direction of a movement
   */
  private getPrimaryDirection(
    start: Point,
    current: Point
  ): "horizontal" | "vertical" | null {
    const dx = Math.abs(current.x - start.x);
    const dy = Math.abs(current.y - start.y);

    // If movement is too small, don't determine a direction yet
    if (
      dx < this.swipeDirectionThreshold &&
      dy < this.swipeDirectionThreshold
    ) {
      return null;
    }

    // Vertical movement is dominant if it exceeds horizontal movement by the tolerance factor
    if (dy > dx * this.swipeVerticalTolerance) {
      return "vertical";
    }

    // Horizontal movement is dominant if it exceeds vertical movement
    if (dx > dy) {
      return "horizontal";
    }

    // If neither is clearly dominant, default to vertical (safer for scrolling)
    return "vertical";
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (!this.checkTarget(e.target!)) {
      return;
    }

    const pos = this.getMousePos(e.clientX, e.clientY);

    this.app.startUserTouch(pos);

    e.preventDefault();
  };

  private onTouchStart = (e: TouchEvent): void => {
    if (!this.checkTarget(e.target!)) {
      return;
    }

    // Reset touch tracking state
    this.isScrolling = false;
    this.touchMoveCount = 0;
    this.primaryDirection = null;
    this.touchStartTime = Date.now();

    if (e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      const pos = this.getMousePos(t.clientX, t.clientY);

      // Store initial touch point for direction detection
      this.initialTouchPoint = pos;

      this.touchPoint = {
        point: pos,
        time: this.touchStartTime,
      };
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
    if (e.changedTouches.length <= 0) return;

    const t = e.changedTouches[0];
    const pos = this.getMousePos(t.clientX, t.clientY);
    this.touchMoveCount++;

    // If we have an initial touch point, determine/update the primary direction of movement
    if (this.initialTouchPoint) {
      // Only determine primary direction once we have enough movement
      if (this.primaryDirection === null) {
        this.primaryDirection = this.getPrimaryDirection(
          this.initialTouchPoint,
          pos
        );
      }

      // Handle based on the primary direction
      if (this.primaryDirection === "horizontal") {
        // For horizontal movement, it's likely a page flip
        if (this.app.getState() === FlippingState.READ) {
          // If we haven't started flipping yet, do it now
          this.app.startUserTouch(this.initialTouchPoint);
        }

        // Always prevent default for horizontal swipes to avoid page scrolling
        if (e.cancelable) {
          e.preventDefault();
        }

        // Update the page flip animation
        this.app.userMove(pos, true);

        // Explicitly mark as not scrolling to ensure correct handling on touchend
        this.isScrolling = false;
      } else if (this.primaryDirection === "vertical") {
        // For vertical movement, it's likely a page scroll
        this.isScrolling = true;

        // If we're already in a flipping state, clean up the flip
        if (this.app.getState() !== FlippingState.READ) {
          this.app.userStop(pos);
        }
      }
      // If primaryDirection is still null, movement is too small to determine
    }
  };

  private onTouchEnd = (e: TouchEvent): void => {
    if (e.changedTouches.length <= 0) return;

    const t = e.changedTouches[0];
    const pos = this.getMousePos(t.clientX, t.clientY);
    const timeDiff = Date.now() - this.touchStartTime;
    let isSwipe = false;

    // Only process flips/swipes if:
    // 1. We have a valid touchPoint
    // 2. We're not in scrolling mode OR primary direction was horizontal
    // 3. There was some movement
    if (
      this.touchPoint !== null &&
      this.initialTouchPoint !== null &&
      (!this.isScrolling || this.primaryDirection === "horizontal") &&
      this.touchMoveCount > 0
    ) {
      const dx = pos.x - this.touchPoint.point.x;

      // Detect a valid swipe - good distance and short duration
      if (Math.abs(dx) > this.swipeDistance && timeDiff < this.swipeTimeout) {
        if (dx > 0) {
          this.app.flipPrev(
            this.touchPoint.point.y < this.app.getRender().getRect().height / 2
              ? FlipCorner.TOP
              : FlipCorner.BOTTOM
          );
        } else {
          this.app.flipNext(
            this.touchPoint.point.y < this.app.getRender().getRect().height / 2
              ? FlipCorner.TOP
              : FlipCorner.BOTTOM
          );
        }
        isSwipe = true;
      }

      // If it wasn't a swipe but the flipbook is in a flipping state,
      // complete the flip based on how far it's progressed
      else if (this.app.getState() !== FlippingState.READ) {
        this.app.userStop(pos, false);
      }
      // Process a tap as a flip when it makes sense
      else if (
        this.touchMoveCount < 3 && // Very little movement
        timeDiff < 300 && // Short duration
        !this.isScrolling && // Definitely not scrolling
        Math.abs(pos.x - this.touchPoint.point.x) < 10 && // Almost no horizontal movement
        Math.abs(pos.y - this.touchPoint.point.y) < 10 // Almost no vertical movement
      ) {
        this.app.userStop(pos, false);
      }
    }
    // Always clean up any flip if we're in scrolling mode to avoid stuck pages
    else if (this.isScrolling && this.app.getState() !== FlippingState.READ) {
      // Force reset the page flip state
      this.app.userStop(pos, true);
    }

    // Important: Pass the isSwipe flag to userStop if we're not already handling a swipe
    if (!isSwipe && this.app.getState() !== FlippingState.READ) {
      this.app.userStop(pos, isSwipe);
    }

    // Clean up touch tracking state
    this.touchPoint = null;
    this.initialTouchPoint = null;
    this.isScrolling = false;
    this.touchMoveCount = 0;
    this.primaryDirection = null;
  };
}
