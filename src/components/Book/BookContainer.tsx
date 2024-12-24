import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import Book from "./Book";
import { IPage } from "@/lib/model/book";

interface IBookProps {
  rtl: boolean;
  isMobile: boolean;
  Pages: React.JSX.Element[];
  Front: React.JSX.Element;
  Back?: React.JSX.Element;
  toc?: {
    title: string;
    pages: IPage[];
  };
  noContentAmount: number;
  children?: ReactNode;
}

const BookContainer: React.FC<IBookProps> = ({
  rtl,
  isMobile,
  toc,
  Pages,
  Front,
  Back,
  noContentAmount,
  children,
}) => {
  const t = useTranslations("Book");

  const next = t("common.next");
  const previous = t("common.previous");

  return (
    <Book
      book={{
        Front,
        Back,
        Pages,
        toc,
      }}
      rtl={rtl}
      isMobile={isMobile}
      actions={{
        next,
        previous,
      }}
      noContentAmount={noContentAmount}
    >
      {children}
    </Book>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
