import { Render } from "../Render/Render";
import { Point } from "../BasicTypes";
import { HTMLPage } from "./HTMLPage";

export interface PageState {
  angle: number;
  area: Point[];
  position: Point;
  hardAngle: number;
  hardDrawingAngle: number;
}

export const PageOrientation = {
  LEFT: 1,
  RIGHT: 2,
} as const;

export type PageOrientation =
  (typeof PageOrientation)[keyof typeof PageOrientation];

export const PageDensity = {
  SOFT: 1,
  HARD: 2,
} as const;

export type PageDensity = (typeof PageDensity)[keyof typeof PageDensity];

export abstract class Page {
  protected state: PageState;
  protected render: Render;
  protected orientation!: PageOrientation;
  protected createdDensity: PageDensity;
  protected nowDrawingDensity: PageDensity;

  protected constructor(render: Render, density: PageDensity) {
    this.state = {
      angle: 0,
      area: [],
      position: { x: 0, y: 0 },
      hardAngle: 0,
      hardDrawingAngle: 0,
    };

    this.createdDensity = density;
    this.nowDrawingDensity = this.createdDensity;

    this.render = render;
  }

  public abstract simpleDraw(orient: PageOrientation): void;

  public abstract draw(tempDensity?: PageDensity | null): void;

  public abstract load(): void;

  public setDensity(density: PageDensity): void {
    this.createdDensity = density;
    this.nowDrawingDensity = density;
  }

  public setDrawingDensity(density: PageDensity): void {
    this.nowDrawingDensity = density;
  }

  public setPosition(pagePos: Point): void {
    this.state.position = pagePos;
  }

  public setAngle(angle: number): void {
    this.state.angle = angle;
  }

  public setArea(area: Point[]): void {
    this.state.area = area;
  }

  public setHardDrawingAngle(angle: number): void {
    this.state.hardDrawingAngle = angle;
  }

  public setHardAngle(angle: number): void {
    this.state.hardAngle = angle;
    this.state.hardDrawingAngle = angle;
  }

  public setOrientation(orientation: PageOrientation): void {
    this.orientation = orientation;
  }

  public getDrawingDensity(): PageDensity {
    return this.nowDrawingDensity;
  }

  public getDensity(): PageDensity {
    return this.createdDensity;
  }

  public getHardAngle(): number {
    return this.state.hardAngle;
  }

  public abstract newTemporaryCopy(): HTMLPage;
  public abstract getTemporaryCopy(): HTMLPage;
  public abstract hideTemporaryCopy(): void;
}
