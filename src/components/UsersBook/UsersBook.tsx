import BookContainer from "@/components/Book/BookContainer";
import PageCover from "@/components/Book/PageCover/PageCover";
import { Page as BookPage } from "@/lib/model/book";

interface IProps {
  title: string;
  rtl: boolean;
}

const UsersBook: React.FC<IProps> = ({ title, rtl }) => {
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
    />
  );
};

UsersBook.displayName = "UsersBook";
export default UsersBook;
