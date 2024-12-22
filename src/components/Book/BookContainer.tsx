import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import { IBook, IToc } from "@/lib/model/book";
import NewBook from "./NewBook/NewBook";
import { BookProvider } from "./NewBook/Context";

interface IBookProps {
  rtl: boolean;
  isMobile: boolean;
  tableOfContentsTitle?: string;
  pagesAmount: number;
  children?: ReactNode;
  book: IBook;
  toc?: IToc;
}

const BookContainer: React.FC<IBookProps> = ({
  rtl,
  isMobile,
  pagesAmount,
  children,
  book,
  toc,
}) => {
  const t = useTranslations("Book");
  const next = t("common.next");
  const previous = t("common.previous");

  const bookParams = {
    rtl,
    pagesAmount,
    book,
    toc,
    text: { next, previous },
    isMobile,
  };

  return (
    <>
      {children}
      <BookProvider bookParams={bookParams}>
        <NewBook />
      </BookProvider>
    </>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
