import { IModalProps } from "./common";

export interface Page {
  id?: number;
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
