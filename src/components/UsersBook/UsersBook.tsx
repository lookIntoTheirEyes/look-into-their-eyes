import { Pathnames } from "@/i18n/routing";
import BookContainer from "@/components/Book/BookContainer";
import PageCover from "@/components/Book/PageCover/PageCover";
import { Page as BookPage } from "@/lib/model/book";
import NewCommentButton from "@/components/UsersBook/NewCommentButton/NewCommentButton";
import styles from "./UsersBook.module.css";

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

  const newButton = (
    <NewCommentButton
      pathname={newPath}
      text={newText}
      pad={!!pagesContent.length}
    />
  );

  if (!pagesContent.length) {
    const msg = newPath === "/visitors/new" ? "commented" : "shared";
    return (
      <div className={styles.noComment}>
        <h1>No one has {msg} yet, click here button to be the first one! </h1>
        {newButton}
      </div>
    );
  }

  return (
    <BookContainer
      pagesContent={pagesContent}
      Pages={Pages}
      rtl={rtl}
      Front={Front}
      Back={Back}
      noContentAmount={1}
    >
      {newButton}
    </BookContainer>
  );
};

UsersBook.displayName = "UsersBook";
export default UsersBook;
