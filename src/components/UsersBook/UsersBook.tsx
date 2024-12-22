import BookContainer from "@/components/Book/BookContainer";
import PageCover from "@/components/Book/PageCover/PageCover";
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

  const Front = <PageCover details={frontDetails} />;

  const Pages = [] as JSX.Element[];

  const noContentPages = 2;
  const pagesAmount = Pages.length + noContentPages;

  return (
    <BookContainer book={{ Front, Pages }} rtl={rtl} pagesAmount={pagesAmount}>
      <NewCommentButton pathname={newPath} text={newText} />
    </BookContainer>
  );
};

UsersBook.displayName = "UsersBook";
export default UsersBook;
