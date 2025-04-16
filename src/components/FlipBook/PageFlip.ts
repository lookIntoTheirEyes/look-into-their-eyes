import { PageCollection } from "./Collection/PageCollection";
import { HTMLPageCollection } from "./Collection/HTMLPageCollection";
import { PageRect, Point } from "./BasicTypes";
import { Flip, FlipCorner, FlippingState } from "./Flip/Flip";
import { Orientation, Render } from "./Render/Render";

import { HTMLUI } from "./UI/HTMLUI";
import { Helper } from "./Helper";
import { EventObject } from "./Event/EventObject";
import { HTMLRender } from "./Render/HTMLRender";
import { FlipSetting, Settings } from "./Settings";
import { UI } from "./UI/UI";

import "./Style/stPageFlip.css";
import { HTMLPage } from "./Page/HTMLPage";

export class PageFlip extends EventObject {
  private mousePosition!: Point;
  private isUserTouch = false;
  private isUserMove = false;
  private moveThreshold = 5; // Minimum movement to trigger page flipping

  private readonly setting: FlipSetting;
  private readonly block: HTMLElement; // Root HTML Element

  private pages!: PageCollection;
  private flipController!: Flip;
  private render!: Render;

  private ui!: UI;

  constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>) {
    super();

    this.setting = new Settings().getSettings(setting);
    this.block = inBlock;
  }

  public destroy(): void {
    this.ui.destroy();
    this.block.remove();
  }

  public update(): void {
    this.pages.getPages().forEach((page) => {
      page.resetDensity();
    });

    this.render.update();
    this.pages.show();
  }

  public updateRTL(newRTL: boolean): void {
    this.ui.setRTLStyle(newRTL);
    this.update();
  }

  public loadFromHTML(
    items: HTMLElement[],
    blankPage: HTMLElement | null
  ): void {
    this.ui = new HTMLUI(this.block, this, this.setting, items);

    this.render = new HTMLRender(this, this.setting, this.ui.getDistElement());

    this.flipController = new Flip(this.render, this);

    this.pages = new HTMLPageCollection(
      this,
      this.render,
      this.ui.getDistElement(),
      items,
      blankPage
    );
    this.ui.update();

    this.pages.load();

    this.render.start();

    this.pages.show(this.setting.startPage);

    setTimeout(() => {
      this.trigger("init", this, this.render.getOrientation());
    }, 0);
  }

  public clear(): void {
    this.pages.destroy();
    (this.ui as HTMLUI).clear();
  }

  public turnToPrevPage(): void {
    this.pages.showPrev();
  }

  public turnToNextPage(): void {
    this.pages.showNext();
  }

  public turnToPage(page: number): void {
    this.pages.show(page);
  }

  public flipNext(corner: FlipCorner = FlipCorner.TOP): void {
    this.flipController.flipNext(corner);
  }

  public flipPrev(corner: FlipCorner = FlipCorner.TOP): void {
    this.flipController.flipPrev(corner);
  }

  public flip(page: number, corner: FlipCorner = FlipCorner.TOP): void {
    this.flipController.flipToPage(page, corner);
  }

  public updatePageIndex(newPage: number): void {
    this.trigger("flip", this, newPage);
  }

  public updateOrientation(newOrientation: Orientation): void {
    this.ui.setOrientationStyle(newOrientation);
    this.update();
    this.trigger("changeOrientation", this, newOrientation);
  }

  public getPageCount(): number {
    return this.pages.getPageCount();
  }

  public getCurrentPageIndex(): number {
    return this.pages.getCurrentPageIndex();
  }

  public getPage(pageIndex: number): HTMLPage {
    return this.pages.getPage(pageIndex);
  }

  public getRender(): Render {
    return this.render;
  }

  public getFlipController(): Flip {
    return this.flipController;
  }

  public getOrientation(): Orientation {
    return this.render.getOrientation();
  }

  public getBoundsRect(): PageRect {
    return this.render.getRect();
  }

  public getSettings(): FlipSetting {
    return this.setting;
  }

  public getUI(): UI {
    return this.ui;
  }

  public getState(): FlippingState {
    return this.flipController.getState();
  }

  public getPageCollection(): PageCollection {
    return this.pages;
  }

  /**
   * Called when user starts interacting with the book
   * @param pos - The position where the user touched/clicked
   */
  public startUserTouch(pos: Point): void {
    // Only start a new touch if we're not already in one
    if (!this.isUserTouch) {
      this.mousePosition = pos;
      this.isUserTouch = true;
      this.isUserMove = false;
    }
  }

  /**
   * Called when user moves while interacting with the book
   * @param pos - Current position
   * @param isTouch - Whether this is a touch event (vs mouse)
   */
  public userMove(pos: Point, isTouch: boolean): void {
    // If not in a touch interaction and not using touch events, show corner effect
    if (!this.isUserTouch && !isTouch && this.setting.showPageCorners) {
      this.flipController.showCorner(pos);
    }
    // If in a touch interaction, process movement
    else if (this.isUserTouch) {
      // Only start folding if we've moved beyond the threshold
      if (
        Helper.GetDistanceBetweenTwoPoint(this.mousePosition, pos) >
        this.moveThreshold
      ) {
        this.isUserMove = true;
        this.flipController.fold(pos);
      }
    }
  }

  /**
   * Gets the current flipping progress as a percentage (0-100)
   */
  public getProgress(): number {
    return this.flipController.getCalculation().getFlippingProgress();
  }

  /**
   * Called when user stops interacting with the book
   * @param pos - The position where the interaction ended
   * @param isSwipe - Whether this was detected as a swipe gesture
   */
  public userStop(pos: Point, isSwipe = false): void {
    // Only process if we're in a touch interaction
    if (this.isUserTouch) {
      this.isUserTouch = false;

      if (!isSwipe) {
        // If user didn't move much, treat as a flip; otherwise complete the fold
        if (!this.isUserMove) {
          this.flipController.flip(pos);
        } else {
          this.flipController.stopMove();
        }
      }
    }
  }
}
