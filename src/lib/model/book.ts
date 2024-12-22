import { IModalProps } from "./common";

export interface IPage {
  id?: number;
  title?: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  imageDescription?: string;
}

export interface IBook {
  Pages: JSX.Element[];
  Front: JSX.Element;
  Back?: JSX.Element;
}

export interface IToc {
  title: string;
  pages: IPage[];
}

export interface ICoverPage extends IPage {
  author?: string;
}

export interface IStoryModalProps
  extends Omit<IModalProps, "children" | "paths"> {
  pageNum: string;
  closeText: string;
}

export const Orientation = {
  PORTRAIT: 1,
  LANDSCAPE: 2,
} as const;

export type Orientation = (typeof Orientation)[keyof typeof Orientation];
