import BookContainer from "@/components/Book/BookContainer";
import PageCover from "@/components/Book/PageCover/PageCover";
import { Page as BookPage } from "@/lib/model/book";
import NewCommentButton from "./NewCommentButton/NewCommentButton";
import { Pathnames } from "@/i18n/routing";

interface IProps {
  title: string;
  newText: string;
  newPath: Pathnames;
  rtl: boolean;
}

const UsersBook: React.FC<IProps> = ({ title, rtl, newText, newPath }) => {
  const frontDetails = {
    title,
  };

  const Front = rtl ? undefined : <PageCover details={frontDetails} />;
  const Back = rtl ? <PageCover details={frontDetails} /> : undefined;

  const Pages = [] as JSX.Element[];
  const pagesContent = [] as BookPage[];

  return (
    <BookContainer
      pagesContent={pagesContent}
      Pages={Pages}
      rtl={rtl}
      Front={Front}
      Back={Back}
      noContentAmount={1}
    >
      <NewCommentButton pathname={newPath} text={newText} />
    </BookContainer>
  );
};

UsersBook.displayName = "UsersBook";
export default UsersBook;
