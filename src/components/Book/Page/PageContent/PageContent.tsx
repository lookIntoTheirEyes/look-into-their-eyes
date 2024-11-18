"use client";

import { useRouter } from "@/i18n/routing";
import styles from "./PageContent.module.css";
import StyledButton from "@/components/StyledButton/StyledButton";
import Image from "@/components/Image/Image";
import { Page } from "@/lib/model/book";

interface PageProps {
  pageNum: number;
  details: Page;
  cta?: string;
  title?: string;
}

const PageContent: React.FC<PageProps> = ({
  pageNum,
  details,
  cta,
  title: chapter,
}) => {
  const router = useRouter();

  const { title, imageUrl, description, imageDescription = title } = details;
  const handleClick = () => {
    router.push(
      { pathname: "/story/details", query: { page: pageNum } },
      { scroll: false }
    );
  };

  return (
    <>
      {Object.keys(details).length && (
        <>
          {chapter && (
            <h2 className='pageHeader'>{`${chapter} ${
              pageNum - 1
            } - ${title}`}</h2>
          )}
          {imageUrl && (
            <div className={styles.imageSection}>
              <div className={styles.pageImage}>
                <Image imageUrl={imageUrl!} alt={imageDescription} />
              </div>
            </div>
          )}
          {description && <p className={styles.pageText}>{description}</p>}
          <StyledButton onClick={handleClick} className={styles.button}>
            {cta}
          </StyledButton>
        </>
      )}
    </>
  );
};

export default PageContent;
