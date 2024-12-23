"use client";

import { useRouter } from "@/i18n/routing";
import { IPage } from "@/lib/model/book";
import StyledButton from "@/components/StyledButton/StyledButton";
import Image from "@/components/Image/Image";
import styles from "./PageContent.module.css";

interface PageProps {
  pageNum: number;
  details: IPage;
  cta?: string;
  title?: string;
  isStory?: boolean;
  priority?: boolean;
}

const PageContent: React.FC<PageProps> = ({
  pageNum,
  details,
  cta,
  title: chapter,
  isStory = true,
  priority = false,
}) => {
  const router = useRouter();

  const { title, imageUrl, description, imageDescription = title } = details;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(
      { pathname: "/story/details", query: { page: pageNum } },
      { scroll: false }
    );
  };

  const pageTitle = isStory ? `${chapter} ${pageNum - 2} - ${title}` : title;

  return (
    <>
      {Object.keys(details).length && (
        <>
          {chapter && <h2 className='pageHeader'>{pageTitle}</h2>}
          {imageUrl && (
            <div className={styles.imageSection}>
              <div className={styles.pageImage}>
                <Image
                  imageUrl={imageUrl!}
                  alt={imageDescription}
                  priority={priority}
                />
              </div>
            </div>
          )}
          {description && <p className={styles.pageText}>{description}</p>}
          {cta && (
            <StyledButton onClick={handleClick} className={styles.button}>
              {cta}
            </StyledButton>
          )}
        </>
      )}
    </>
  );
};

export default PageContent;
