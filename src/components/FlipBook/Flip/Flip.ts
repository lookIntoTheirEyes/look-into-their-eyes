import { Orientation, Render } from "../Render/Render";
import { PageFlip } from "../PageFlip";
import { Helper } from "../Helper";
import { PageRect, Point } from "../BasicTypes";
import { FlipCalculation } from "./FlipCalculation";
import { PageDensity } from "../Page/Page";
import { HTMLPage } from "../Page/HTMLPage";

export const FlipDirection = {
  FORWARD: 1,
  BACK: 2,
} as const;

export type FlipDirection = (typeof FlipDirection)[keyof typeof FlipDirection];

export const FlipCorner = {
  TOP: 1,
  BOTTOM: 2,
} as const;

export type FlipCorner = (typeof FlipCorner)[keyof typeof FlipCorner];

export const FlippingState = {
  USER_FOLD: 1,
  FOLD_CORNER: 2,
  FLIPPING: 3,
  READ: 4,
} as const;

export type FlippingState = (typeof FlippingState)[keyof typeof FlippingState];

export class Flip {
  private readonly render: Render;
  private readonly app: PageFlip;
  private flippingPage: HTMLPage | null = null;
  private bottomPage: HTMLPage | null = null;
  private calc: FlipCalculation | null = null;
  private state: FlippingState = FlippingState.READ;

  constructor(render: Render, app: PageFlip) {
    this.render = render;
    this.app = app;
  }

  public fold(globalPos: Point): void {
    this.setState(FlippingState.USER_FOLD);

    if (this.calc === null) this.start(globalPos);

    this.do(this.render.convertToPage(globalPos));
  }

  public flip(globalPos: Point): void {
    if (this.calc !== null) this.render.finishAnimation();

    if (!this.start(globalPos)) return;

    const calc = this.calc as FlipCalculation;

    const rect = this.getBoundsRect();

    this.setState(FlippingState.FLIPPING);

    // Margin from top to start flipping
    const topMargins = rect.height / 10;

    // Defining animation start points
    const yStart =
      calc.getCorner() === FlipCorner.BOTTOM
        ? rect.height - topMargins
        : topMargins;

    const yDest = calc.getCorner() === FlipCorner.BOTTOM ? rect.height : 0;

    // Сalculations for these points
    calc.calc({ x: rect.pageWidth - topMargins, y: yStart });

    // Run flipping animation
    this.animateFlippingTo(
      { x: rect.pageWidth - topMargins, y: yStart },
      { x: -rect.pageWidth, y: yDest },
      true
    );
  }

  public start(globalPos: Point): FlipCalculation | undefined {
    this.reset();

    const bookPos = this.render.convertToBook(globalPos);
    const rect = this.getBoundsRect();

    // Find the direction of flipping
    const direction = this.getDirectionByPoint(bookPos);

    // Find the active corner
    const flipCorner =
      bookPos.y >= rect.height / 2 ? FlipCorner.BOTTOM : FlipCorner.TOP;

    if (!this.checkDirection(direction)) return;

    try {
      this.flippingPage = this.app
        .getPageCollection()
        .getFlippingPage(direction);

      this.bottomPage = this.app.getPageCollection().getBottomPage(direction);

      // In landscape mode, needed to set the density  of the next page to the same as that of the flipped
      if (this.render.getOrientation() === Orientation.LANDSCAPE) {
        if (direction === FlipDirection.BACK) {
          const nextPage = this.app
            .getPageCollection()
            .nextBy(this.flippingPage);

          if (nextPage !== null) {
            if (this.flippingPage.getDensity() !== nextPage.getDensity()) {
              this.flippingPage.setDrawingDensity(PageDensity.HARD);
              nextPage.setDrawingDensity(PageDensity.HARD);
            }
          }
        } else {
          const prevPage = this.app
            .getPageCollection()
            .prevBy(this.flippingPage);

          if (prevPage !== null) {
            if (this.flippingPage.getDensity() !== prevPage.getDensity()) {
              this.flippingPage.setDrawingDensity(PageDensity.HARD);
              prevPage.setDrawingDensity(PageDensity.HARD);
            }
          }
        }
      }

      this.render.setDirection(direction);
      this.calc = new FlipCalculation(
        direction,
        flipCorner,
        rect.pageWidth.toString(10),
        rect.height.toString(10)
      );

      return this.calc;
    } catch {
      return;
    }
  }

  private do(pagePos: Point): void {
    if (this.calc === null) return;

    if (this.calc.calc(pagePos)) {
      const progress = this.calc.getFlippingProgress();
      const bottomPage = this.bottomPage as HTMLPage;
      const flippingPage = this.flippingPage as HTMLPage;

      bottomPage.setArea(this.calc.getBottomClipArea());
      bottomPage.setPosition(this.calc.getBottomPagePosition());
      bottomPage.setAngle(0);
      bottomPage.setHardAngle(0);

      flippingPage.setArea(this.calc.getFlippingClipArea());
      flippingPage.setPosition(this.calc.getActiveCorner());
      flippingPage.setAngle(this.calc.getAngle());

      if (this.calc.getDirection() === FlipDirection.FORWARD) {
        flippingPage.setHardAngle((90 * (200 - progress * 2)) / 100);
      } else {
        flippingPage.setHardAngle((-90 * (200 - progress * 2)) / 100);
      }

      this.render.setPageRect(this.calc.getRect());

      this.render.setBottomPage(bottomPage);
      this.render.setFlippingPage(flippingPage);

      this.render.setShadowData(
        this.calc.getShadowStartPoint(),
        this.calc.getShadowAngle(),
        progress,
        this.calc.getDirection()
      );
    }
  }

  public flipToPage(page: number, corner: FlipCorner): void {
    const current = this.app.getPageCollection().getCurrentSpreadIndex();
    const next = this.app
      .getPageCollection()
      .getSpreadIndexByPage(page) as number;

    try {
      if (next > current) {
        this.app.getPageCollection().setCurrentSpreadIndex(next - 1);
        this.flipNext(corner);
      }
      if (next < current) {
        this.app.getPageCollection().setCurrentSpreadIndex(next + 1);
        this.flipPrev(corner);
      }
    } catch {}
  }

  public flipNext(corner: FlipCorner): void {
    this.flip({
      x: this.render.getRect().left + this.render.getRect().pageWidth * 2 - 10,
      y: corner === FlipCorner.TOP ? 1 : this.render.getRect().height - 2,
    });
  }

  public flipPrev(corner: FlipCorner): void {
    this.flip({
      x: 10,
      y: corner === FlipCorner.TOP ? 1 : this.render.getRect().height - 2,
    });
  }

  public stopMove(): void {
    if (this.calc === null) return;

    const pos = this.calc.getPosition();
    const rect = this.getBoundsRect();

    const y = this.calc.getCorner() === FlipCorner.BOTTOM ? rect.height : 0;

    if (pos.x <= 0)
      this.animateFlippingTo(pos, { x: -rect.pageWidth, y }, true);
    else this.animateFlippingTo(pos, { x: rect.pageWidth, y }, false);
  }

  public showCorner(globalPos: Point): void {
    if (!this.checkState(FlippingState.READ, FlippingState.FOLD_CORNER)) return;

    const rect = this.getBoundsRect();
    const pageWidth = rect.pageWidth;

    if (this.isPointOnCorners(globalPos)) {
      if (this.calc === null) {
        const calc = this.start(globalPos);
        if (!calc) return;

        this.setState(FlippingState.FOLD_CORNER);

        calc.calc({ x: pageWidth - 1, y: 1 });

        const fixedCornerSize = 50;
        const yStart =
          calc.getCorner() === FlipCorner.BOTTOM ? rect.height - 1 : 1;

        const yDest =
          calc.getCorner() === FlipCorner.BOTTOM
            ? rect.height - fixedCornerSize
            : fixedCornerSize;

        this.animateFlippingTo(
          { x: pageWidth - 1, y: yStart },
          { x: pageWidth - fixedCornerSize, y: yDest },
          false,
          false
        );
      } else {
        this.do(this.render.convertToPage(globalPos));
      }
    } else {
      this.setState(FlippingState.READ);
      this.render.finishAnimation();

      this.stopMove();
    }
  }

  private animateFlippingTo(
    start: Point,
    dest: Point,
    isTurned: boolean,
    needReset = true
  ): void {
    const points = Helper.GetCordsFromTwoPoint(start, dest);

    // Create frames
    const frames = [];
    for (const p of points) frames.push(() => this.do(p));

    const duration = this.getAnimationDuration(points.length);

    this.render.startAnimation(frames, duration, () => {
      // callback function
      if (!this.calc) return;

      if (isTurned) {
        if (this.calc.getDirection() === FlipDirection.BACK)
          this.app.turnToPrevPage();
        else this.app.turnToNextPage();
      }

      if (needReset) {
        this.render.setBottomPage(null);
        this.render.setFlippingPage(null);
        this.render.clearShadow();

        this.setState(FlippingState.READ);
        this.reset();
      }
    });
  }

  public getCalculation(): FlipCalculation {
    return this.calc as FlipCalculation;
  }

  public getState(): FlippingState {
    return this.state;
  }

  private setState(newState: FlippingState): void {
    if (this.state !== newState) {
      this.state = newState;
    }
  }

  private getDirectionByPoint(touchPos: Point): FlipDirection {
    const rect = this.getBoundsRect();

    if (this.render.getOrientation() === Orientation.PORTRAIT) {
      if (touchPos.x - rect.pageWidth <= rect.width / 5) {
        return FlipDirection.BACK;
      }
    } else if (touchPos.x < rect.width / 2) {
      return FlipDirection.BACK;
    }

    return FlipDirection.FORWARD;
  }

  private getAnimationDuration(size: number): number {
    const defaultTime = this.app.getSettings().flippingTime;

    if (size >= 1000) return defaultTime;

    return (size / 1000) * defaultTime;
  }

  private checkDirection(direction: FlipDirection): boolean {
    if (direction === FlipDirection.FORWARD)
      return this.app.getCurrentPageIndex() < this.app.getPageCount() - 1;

    return this.app.getCurrentPageIndex() >= 1;
  }

  private reset(): void {
    this.calc = null;
    this.flippingPage = null;
    this.bottomPage = null;
  }

  private getBoundsRect(): PageRect {
    return this.render.getRect();
  }

  private checkState(...states: FlippingState[]): boolean {
    for (const state of states) {
      if (this.state === state) return true;
    }

    return false;
  }

  private isPointOnCorners(globalPos: Point): boolean {
    const rect = this.getBoundsRect();
    const pageWidth = rect.pageWidth;

    const operatingDistance =
      Math.sqrt(Math.pow(pageWidth, 2) + Math.pow(rect.height, 2)) / 5;

    const bookPos = this.render.convertToBook(globalPos);

    return (
      bookPos.x > 0 &&
      bookPos.y > 0 &&
      bookPos.x < rect.width &&
      bookPos.y < rect.height &&
      (bookPos.x < operatingDistance ||
        bookPos.x > rect.width - operatingDistance) &&
      (bookPos.y < operatingDistance ||
        bookPos.y > rect.height - operatingDistance)
    );
  }
}
