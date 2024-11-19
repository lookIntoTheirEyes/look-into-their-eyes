import { Pathnames } from "@/i18n/routing";
import { Language } from "./language";

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

export interface IModalProps {
  children: React.ReactNode;
  lang: Language;
  closeText?: string;
  center?: boolean;
  paths: { curr: Pathnames; next: Pathnames };
}
