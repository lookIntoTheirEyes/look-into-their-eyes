import { IModalProps } from "./common";

export interface IPage {
  id?: number;
  title?: string;
  description?: string;
  longDescription?: string;
  imageUrl?: string;
  imageDescription?: string;
}

export interface CoverPage extends IPage {
  author?: string;
}

export interface IStoryModalProps
  extends Omit<IModalProps, "children" | "paths"> {
  pageNum: string;
  closeText: string;
}
