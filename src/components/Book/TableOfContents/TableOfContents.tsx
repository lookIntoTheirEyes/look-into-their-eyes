import localStyles from "./TableOfContents.module.css";

interface TableOfContentsProps {
  pages: { title: string; pageNum: number }[];
  rtl: boolean;
  navigateToPage: (pageNum: number) => void;
  styles: Record<string, string>;
  title: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  pages,
  navigateToPage,
  styles,
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
      <h2 className={`${styles.pageHeader} ${localStyles.pageHeader}`}>
        {title}
      </h2>
      <ul className={localStyles.tocList}>
        {pages.map(({ pageNum, title }, index) => (
          <li key={index} className={localStyles.tocItem}>
            <div
              onClick={(ev) => navigate(ev, pageNum)}
              className={localStyles.tocEntry}
            >
              <div className={localStyles.tocTitle}>
                <button className={localStyles.tocButton}>{title}</button>
              </div>
              <div className={localStyles.pageNumber}>{pageNum}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TableOfContents;
