import { IModalProps } from "./common";

export interface Page {
  title?: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  imageDescription?: string;
}

export interface CoverPage extends Page {
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
