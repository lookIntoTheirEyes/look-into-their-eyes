import { Orientation, Render } from "../Render/Render";
import { PageDensity } from "../Page/Page";
import { PageFlip } from "../PageFlip";
import { FlipDirection } from "../Flip/Flip";
import { HTMLPage } from "../Page/HTMLPage";

type NumberArray = number[];

export abstract class PageCollection {
  protected readonly app: PageFlip;
  protected readonly render: Render;
  protected readonly isShowCover: boolean;
  protected pages: HTMLPage[] = [];
  protected currentPageIndex = 0;
  protected blankPage: HTMLPage | null = null;

  protected currentSpreadIndex = 0;
  protected landscapeSpread: NumberArray[] = [];
  protected portraitSpread: NumberArray[] = [];

  protected constructor(
    app: PageFlip,
    render: Render,
    blankPage: HTMLElement | null,
    parent: HTMLElement
  ) {
    this.render = render;
    this.app = app;
    if (blankPage) {
      const clonedElement = blankPage.cloneNode(true) as HTMLElement;
      this.blankPage = new HTMLPage(render, clonedElement, PageDensity.SOFT);

      this.blankPage.load();
      parent.appendChild(clonedElement);
    }

    this.currentPageIndex = 0;
    this.isShowCover = this.app.getSettings().showCover;
  }

  public abstract load(): void;

  public destroy(): void {
    this.pages = [];
  }

  protected createSpread(): void {
    this.landscapeSpread = [];
    this.portraitSpread = [];

    for (let i = 0; i < this.pages.length; i++) {
      this.portraitSpread.push([i]);
    }

    let start = 0;
    if (this.isShowCover) {
      this.pages[0].setDensity(PageDensity.HARD);
      this.landscapeSpread.push([start]);
      start++;
    }

    const isBlankPage = this.hasBlankPage(true);

    const pagesLength = this.getPagesLength(true);

    for (let i = start; i < pagesLength; i += 2) {
      if (isBlankPage && i === pagesLength - 3) {
        this.landscapeSpread.push([i, -1]);
      } else if (i < pagesLength - 1) this.landscapeSpread.push([i, i + 1]);
      else {
        this.landscapeSpread.push([isBlankPage ? i - 1 : i]);
        this.pages[isBlankPage ? i - 1 : i].setDensity(PageDensity.HARD);
      }
    }
  }

  protected getSpread(): NumberArray[] {
    return this.render.getOrientation() === Orientation.LANDSCAPE
      ? this.landscapeSpread
      : this.portraitSpread;
  }

  public getSpreadIndexByPage(pageNum: number): number | null {
    const spread = this.getSpread();

    for (let i = 0; i < spread.length; i++)
      if (pageNum === spread[i][0] || pageNum === spread[i][1]) return i;

    return null;
  }

  public getPageCount(): number {
    return this.getPagesLength();
  }

  public getPages(): HTMLPage[] {
    return [...this.pages, this.blankPage].filter(Boolean) as HTMLPage[];
  }

  public getPage(pageIndex: number): HTMLPage {
    if (pageIndex >= 0 && pageIndex < this.getPagesLength()) {
      return this.pages[pageIndex];
    }

    throw new Error("Invalid page number");
  }

  public nextBy(current: HTMLPage): HTMLPage | null {
    const idx = this.pages.indexOf(current);

    if (idx === -1) {
      return this.blankPage;
    }

    if (idx < this.pages.length - 1) return this.pages[idx + 1];

    return null;
  }

  public prevBy(current: HTMLPage): HTMLPage | null {
    const idx = this.pages.indexOf(current);

    if (idx > 0)
      return this.hasBlankPage() && idx === this.getPagesLength() - 2
        ? this.blankPage
        : this.pages[idx - 1];

    return null;
  }

  public getFlippingPage(direction: FlipDirection): HTMLPage {
    const current = this.currentSpreadIndex;

    if (this.render.getOrientation() === Orientation.PORTRAIT) {
      return direction === FlipDirection.FORWARD
        ? this.pages[current].newTemporaryCopy()
        : this.pages[current - 1];
    } else {
      const spread =
        direction === FlipDirection.FORWARD
          ? this.getSpread()[current + 1]
          : this.getSpread()[current - 1];

      if (spread.length === 1) return this.getPageByVal(spread[0]);

      return direction === FlipDirection.FORWARD
        ? this.getPageByVal(spread[0])
        : this.getPageByVal(spread[1]);
    }
  }

  public getBottomPage(direction: FlipDirection): HTMLPage {
    const current = this.currentSpreadIndex;

    if (this.render.getOrientation() === Orientation.PORTRAIT) {
      return direction === FlipDirection.FORWARD
        ? this.pages[current + 1]
        : this.pages[current - 1];
    } else {
      const spread =
        direction === FlipDirection.FORWARD
          ? this.getSpread()[current + 1]
          : this.getSpread()[current - 1];

      if (spread.length === 1) return this.getPageByVal(spread[0]);

      return direction === FlipDirection.FORWARD
        ? this.getPageByVal(spread[1])
        : this.getPageByVal(spread[0]);
    }
  }

  public showNext(): void {
    if (this.currentSpreadIndex < this.getSpread().length) {
      this.currentSpreadIndex++;
      this.showSpread();
    }
  }

  public showPrev(): void {
    if (this.currentSpreadIndex > 0) {
      this.currentSpreadIndex--;
      this.showSpread();
    }
  }

  public getCurrentPageIndex(): number {
    return this.currentPageIndex;
  }

  public show(pageNum: number | null = null): void {
    const pagesLength = this.getPagesLength();
    if (pageNum === null || pageNum < 0 || pageNum >= pagesLength)
      pageNum = this.currentPageIndex;

    if (this.hasBlankPage() && pageNum > pagesLength - 3) {
      pageNum = pageNum - 1;
    }

    const spreadIndex = this.getSpreadIndexByPage(pageNum);
    if (spreadIndex !== null && spreadIndex >= 0) {
      this.currentSpreadIndex = spreadIndex;
      this.showSpread();
    }
  }

  public getCurrentSpreadIndex(): number {
    return this.currentSpreadIndex;
  }

  public setCurrentSpreadIndex(newIndex: number): void {
    if (newIndex >= 0 && newIndex < this.getSpread().length) {
      this.currentSpreadIndex = newIndex;
    } else {
      throw new Error("Invalid page");
    }
  }

  private showSpread(): void {
    const spread = this.getSpread()[this.currentSpreadIndex];

    if (spread.length === 2) {
      const leftPage = this.getPageByVal(spread[0]);
      this.render.setLeftPage(leftPage);
      const rightPage = this.getPageByVal(spread[1]);

      this.render.setRightPage(rightPage);
    } else {
      if (this.render.getOrientation() === Orientation.LANDSCAPE) {
        if (
          spread[0] ===
          this.getPagesLength() - (this.hasBlankPage() ? 2 : 1)
        ) {
          this.render.setLeftPage(this.getPageByVal(spread[0]));
          this.render.setRightPage(null);
        } else {
          this.render.setLeftPage(null);
          this.render.setRightPage(this.getPageByVal(spread[0]));
        }
      } else {
        this.render.setLeftPage(null);
        this.render.setRightPage(this.getPageByVal(spread[0]));
      }
    }

    this.currentPageIndex =
      this.hasBlankPage() && spread[0] === this.getPagesLength() - 2
        ? this.getPagesLength() - 1
        : spread[0];

    this.app.updatePageIndex(this.currentPageIndex);
  }

  public needBlankPage(): boolean {
    return this.pages.length % 2 === 1;
  }

  public hasBlankPage(
    condition = this.render.getOrientation() === Orientation.LANDSCAPE
  ): boolean {
    return condition && this.needBlankPage() && this.blankPage !== null;
  }

  protected getPagesLength(isInit?: boolean): number {
    return this.hasBlankPage(isInit)
      ? this.pages.length + 1
      : this.pages.length;
  }

  private getPageByVal(spreadNum: number) {
    return spreadNum === -1 ? this.blankPage! : this.pages[spreadNum];
  }
}
