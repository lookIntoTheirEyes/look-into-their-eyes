import { Pathnames } from "@/i18n/routing";
import { Language } from "@/lib/model/language";
import { getAllPages } from "@/lib/utils/heroesService";
import Page from "@/components/Book/Page/Page";
import PageCover from "@/components/Book/PageCover/PageCover";
import BookContainer from "@/components/Book/BookContainer";
import PageContent from "@/components/Book/Page/PageContent/PageContent";
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
  const isComment = newPath === "/visitors/new";

  const frontDetails = {
    title,
  };
  const noContentPages = 2;
  const pageNum = (i: number) => i + 1 + noContentPages - 1;

  const Front = <PageCover details={frontDetails} />;
  const pages = getAllPages(
    rtl ? Language.he : Language.en,
    isComment ? "visitor" : "family"
  );

  const Pages = structuredClone(pages).map((content, i) => (
    <Page isMobile={isMobile} rtl={rtl} key={content.id} pageNum={pageNum(i)}>
      {
        <PageContent
          details={content}
          pageNum={pageNum(i)}
          title={content.title}
          isStory={false}
        />
      }
    </Page>
  ));

  const newButton = (
    <NewCommentButton pathname={newPath} text={newText} pad={!!Pages.length} />
  );

  if (!Pages.length) {
    return (
      <div className={styles.noComment}>
        <h1>{noCommentsText}</h1>
        {newButton}
      </div>
    );
  }
  const pagesAmount = Pages.length + noContentPages;

  return (
    <BookContainer
      book={{ Front, Pages }}
      pagesAmount={pagesAmount}
      rtl={rtl}
      // isMobile={isMobile}
    >
      {newButton}
    </BookContainer>
  );
};

UsersBook.displayName = "UsersBook";
export default UsersBook;
