import { useTranslations } from "next-intl";
import { ReactNode } from "react";

import { Page as BookPage } from "@/lib/model/book";
import NewBook from "./NewBook/NewBook";

interface IBookProps {
  rtl: boolean;
  tableOfContentsTitle?: string;
  pagesContent: BookPage[];
  children?: ReactNode;
}

const BookContainer: React.FC<IBookProps> = ({
  rtl,
  pagesContent,
  children,
}) => {
  const t = useTranslations("Book");
  t("story.tableOfContents");

  const toc = {
    title: t("story.tableOfContents"),
    pages: pagesContent,
  };

  const next = t("common.next");
  const previous = t("common.previous");

  const noContentPages = 3;

  const frontDetails = {
    title: t("story.front.title"),
    author: t("story.front.author"),
    description: t("story.front.description"),
    longDescription: t("story.front.longDescription"),
  };
  const backDetails = {
    title: t("story.back.title"),
    description: t("story.back.description"),
    longDescription: t("story.back.longDescription"),
  };

  return (
    <>
      {children}
      <NewBook
        storyTitle={t("story.title")}
        pageCta={t("common.pageCta")}
        noContentPages={noContentPages}
        frontDetails={frontDetails}
        backDetails={backDetails}
        bookPages={pagesContent}
        isRtl={rtl}
        text={{ next, previous }}
        toc={toc}
      />
    </>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
