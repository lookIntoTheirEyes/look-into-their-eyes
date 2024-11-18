import { Page as BookPage } from "@/lib/utils/heroesService";
import PageContainer from "../PageContainer/PageContainer";
import Book from "./Book";

interface IBookProps {
  rtl: boolean;
  text: {
    tableOfContentsTitle: string;
    next: string;
    previous: string;
  };
  Pages: JSX.Element[];
  Front: JSX.Element;
  Back: JSX.Element;
  pagesContent: BookPage[];
}

const BookContainer: React.FC<IBookProps> = ({
  rtl,
  text: { tableOfContentsTitle, next, previous },
  Pages,
  pagesContent,
  Front,
  Back,
}) => {
  const toc = {
    title: tableOfContentsTitle,
    pages: pagesContent,
  };

  return (
    <PageContainer isStory>
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
      />
    </PageContainer>
  );
};

BookContainer.displayName = "BookContainer";
export default BookContainer;
