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
    event: React.MouseEvent<HTMLDivElement>,
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
          <li key={index} className={styles.tocItem}>
            <div
              onClick={(ev) => navigate(ev, pageNum)}
              className={styles.tocEntry}
            >
              <div className={styles.tocTitle}>
                <button className={styles.tocButton}>{title}</button>
              </div>
              <div className={styles.pageNumber}>{pageNum}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TableOfContents;
