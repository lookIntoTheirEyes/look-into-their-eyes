import { Page as BookPage } from "@/lib/utils/heroesService";
import PageContainer from "../PageContainer/PageContainer";
import Book from "./Book";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";

interface IBookProps {
  rtl: boolean;
  tableOfContentsTitle?: string;
  Pages: JSX.Element[];
  Front?: JSX.Element;
  Back?: JSX.Element;
  pagesContent: BookPage[];
  noContentAmount: number;
  children?: ReactNode;
}

const BookContainer: React.FC<IBookProps> = ({
  rtl,
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

  const next = t("actions.next");
  const previous = t("actions.previous");

  return (
    <PageContainer isStory>
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
          actions={{
            next,
            previous,
          }}
          noContentAmount={noContentAmount}
        />
      </>
    </PageContainer>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
