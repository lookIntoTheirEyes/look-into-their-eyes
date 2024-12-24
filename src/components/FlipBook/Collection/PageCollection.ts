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

    this.createSpread();
    this.isShowCover = this.app.getSettings().showCover;
  }

  public abstract load(): void;

  public destroy(): void {
    this.pages = [];
  }

  protected createSpread(): void {
    this.landscapeSpread = [];
    this.portraitSpread = [];

    this.portraitSpread = this.pages.map((_, i) => [i]);

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
      } else if (i < pagesLength - 1) {
        this.landscapeSpread.push([i, i + 1]);
      } else {
        const pageIndex = isBlankPage ? i - 1 : i;
        this.landscapeSpread.push([pageIndex]);
        this.pages[pageIndex].setDensity(PageDensity.HARD);
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
    return spread.findIndex((s) => s.includes(pageNum));
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
    if (idx === -1) return this.blankPage;
    return idx < this.pages.length - 1 ? this.pages[idx + 1] : null;
  }

  public prevBy(current: HTMLPage): HTMLPage | null {
    const idx = this.pages.indexOf(current);
    if (idx > 0) {
      return this.hasBlankPage() && idx === this.getPagesLength() - 2
        ? this.blankPage
        : this.pages[idx - 1];
    }
    return null;
  }

  public getFlippingPage(direction: FlipDirection): HTMLPage {
    const current = this.currentSpreadIndex;
    const orientation = this.render.getOrientation();

    if (orientation === Orientation.PORTRAIT) {
      return direction === FlipDirection.FORWARD
        ? this.pages[current].newTemporaryCopy()
        : this.pages[current - 1];
    }

    const spread =
      direction === FlipDirection.FORWARD
        ? this.getSpread()[current + 1]
        : this.getSpread()[current - 1];

    if (spread.length === 1) return this.getPageByVal(spread[0]);

    return direction === FlipDirection.FORWARD
      ? this.getPageByVal(spread[0])
      : this.getPageByVal(spread[1]);
  }

  public getBottomPage(direction: FlipDirection): HTMLPage {
    const current = this.currentSpreadIndex;
    const orientation = this.render.getOrientation();

    if (orientation === Orientation.PORTRAIT) {
      return direction === FlipDirection.FORWARD
        ? this.pages[current + 1]
        : this.pages[current - 1];
    }

    const spread =
      direction === FlipDirection.FORWARD
        ? this.getSpread()[current + 1]
        : this.getSpread()[current - 1];

    if (spread.length === 1) return this.getPageByVal(spread[0]);

    return direction === FlipDirection.FORWARD
      ? this.getPageByVal(spread[1])
      : this.getPageByVal(spread[0]);
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
    let targetPage = pageNum;

    if (targetPage === null || targetPage < 0 || targetPage >= pagesLength) {
      targetPage = this.currentPageIndex;
    }

    if (targetPage > 0 && this.hasBlankPage() && targetPage > pagesLength - 3) {
      targetPage = targetPage - (targetPage > pagesLength - 2 ? 1 : 0);
    }

    const spreadIndex = this.getSpreadIndexByPage(targetPage);
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
    const orientation = this.render.getOrientation();

    if (spread.length === 2) {
      this.render.setLeftPage(this.getPageByVal(spread[0]));
      this.render.setRightPage(this.getPageByVal(spread[1]));
    } else {
      if (orientation === Orientation.LANDSCAPE) {
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

    const needFactor =
      this.hasBlankPage() && spread[0] === this.getPagesLength() - 2;
    this.currentPageIndex = needFactor ? this.getPagesLength() - 2 : spread[0];
    this.app.updatePageIndex(this.currentPageIndex + (needFactor ? 1 : 0));
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

  private getPageByVal(val: number): HTMLPage {
    return val === -1 ? this.blankPage! : this.pages[val];
  }
}
