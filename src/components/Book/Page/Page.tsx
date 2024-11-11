"use client";
import { forwardRef } from "react";
import localStyles from "./Page.module.css";
import { Page as HeroPage } from "@/lib/utils/heroesService";
import Image from "../../Image/Image";
import { useRouter } from "next/navigation";
import StyledButton from "@/components/StyledButton/StyledButton";

interface PageProps {
  pageNum: number;
  styles: Record<string, string>;
  details: HeroPage;
  rtl?: boolean;
  cta?: string;
  title?: string;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, styles, rtl, details, cta, title: chapter }, ref) => {
    const router = useRouter();
    const isRightPage = pageNum % 2 === 0 ? rtl : !rtl;

    const {
      title,
      imageUrl,
      description,
      imageDescription = "Sample Image",
    } = details;
    const handleClick = () => {
      router.push(`/story/details?page=${pageNum}`, { scroll: false });
    };

    return (
      <div
        className={`${styles.page} ${isRightPage ? styles.right : styles.left}`}
        ref={ref}
      >
        <div className={styles.pageContent}>
          {Object.keys(details).length && (
            <>
              {chapter && (
                <h2 className={localStyles.pageHeader}>{`${chapter} ${
                  pageNum - 1
                } - ${title}`}</h2>
              )}
              {imageUrl && (
                <div className={localStyles.imageSection}>
                  <div className={localStyles.pageImage}>
                    <Image imageUrl={imageUrl!} alt={imageDescription} />
                  </div>
                </div>
              )}
              {description && (
                <p className={localStyles.pageText}>{description}</p>
              )}
              <StyledButton
                onClick={handleClick}
                className={localStyles.button}
              >
                {cta}
              </StyledButton>
            </>
          )}
          <div className={localStyles.pageFooter}>{pageNum}</div>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
