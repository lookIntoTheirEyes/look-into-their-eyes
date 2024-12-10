import { Pathnames } from "@/i18n/routing";
import BookContainer from "@/components/Book/BookContainer";
import PageCover from "@/components/Book/PageCover/PageCover";
import { Page as BookPage } from "@/lib/model/book";
import NewCommentButton from "@/components/UsersBook/NewCommentButton/NewCommentButton";
import styles from "./UsersBook.module.css";

interface IProps {
  title: string;
  newText: string;
  noCommentsText: string;
  newPath: Pathnames;
  rtl: boolean;
  isMobile: boolean;
}

const UsersBook: React.FC<IProps> = ({
  title,
  rtl,
  isMobile,
  newText,
  newPath,
  noCommentsText,
}) => {
  const frontDetails = {
    title,
  };

  const Front = <PageCover details={frontDetails} />;

  const Pages = [] as JSX.Element[];
  const pagesContent = [] as BookPage[];

  const newButton = (
    <NewCommentButton
      pathname={newPath}
      text={newText}
      pad={!!pagesContent.length}
    />
  );

  if (!pagesContent.length) {
    return (
      <div className={styles.noComment}>
        <h1>{noCommentsText}</h1>
        {newButton}
      </div>
    );
  }

  return (
    <BookContainer
      pagesContent={pagesContent}
      Pages={Pages}
      rtl={rtl}
      isMobile={isMobile}
      Front={Front}
      noContentAmount={1}
    >
      {newButton}
    </BookContainer>
  );
};

UsersBook.displayName = "UsersBook";
export default UsersBook;
