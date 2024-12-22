import styles from "./TableOfContents.module.css";

interface TableOfContentsProps {
  pages: { title: string; pageNum: number }[];
  rtl: boolean;
  navigateToPage: (pageNum: number) => void;
  title: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  pages,
  navigateToPage,
  title,
}) => {
  const navigate = (
    event: React.MouseEvent<HTMLLIElement>,
    pageNum: number
  ) => {
    event.stopPropagation();
    navigateToPage(pageNum);
  };

  return (
    <>
      <h2 className={`pageHeader ${styles.pageHeader}`}>{title}</h2>
      <ul className={styles.tocList}>
        {pages.map(({ pageNum, title }, index) => (
          <li
            onClick={(ev) => navigate(ev, pageNum)}
            key={index}
            className={styles.tocItem}
          >
            <button className={styles.tocButton}>{title}</button>
            <span className={styles.pageNumber}>{pageNum}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TableOfContents;
