import { useTranslations } from "next-intl";
import { ReactNode } from "react";
import Book from "./Book";
import { Page as BookPage } from "@/lib/model/book";

interface IBookProps {
  rtl: boolean;
  isMobile: boolean;
  tableOfContentsTitle?: string;
  Pages: JSX.Element[];
  Front: JSX.Element;
  Back?: JSX.Element;
  pagesContent: BookPage[];
  noContentAmount: number;
  children?: ReactNode;
}

const BookContainer: React.FC<IBookProps> = ({
  rtl,
  isMobile,
  tableOfContentsTitle,
  Pages,
  pagesContent,
  Front,
  Back,
  noContentAmount,
  children,
}) => {
  const t = useTranslations("Book");

  const toc = tableOfContentsTitle
    ? {
        title: tableOfContentsTitle,
        pages: pagesContent,
      }
    : undefined;

  const next = t("common.next");
  const previous = t("common.previous");

  return (
    <>
      {children}
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
      />
    </>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
