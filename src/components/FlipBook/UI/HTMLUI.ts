import { UI } from "./UI";
import { PageFlip } from "../PageFlip";
import { FlipSetting } from "../Settings";

export class HTMLUI extends UI {
  private items: HTMLElement[];

  constructor(
    inBlock: HTMLElement,
    app: PageFlip,
    setting: FlipSetting,
    items: HTMLElement[]
  ) {
    super(inBlock, app, setting);

    // Second wrapper to HTML page
    this.wrapper.insertAdjacentHTML(
      "afterbegin",
      '<div class="stf__block"></div>'
    );

    this.distElement = inBlock.querySelector(".stf__block")!;

    this.items = items;
    for (const item of items) {
      this.distElement.appendChild(item);
    }

    this.setHandlers();
  }

  public clear(): void {
    for (const item of this.items) {
      this.parentElement.appendChild(item);
    }
  }

  public updateItems(items: HTMLElement[]): void {
    this.removeHandlers();

    this.distElement.innerHTML = "";

    for (const item of items) {
      this.distElement.appendChild(item);
    }
    this.items = items;

    this.setHandlers();
  }

  public update(): void {
    this.app.getRender().update();
  }
}
