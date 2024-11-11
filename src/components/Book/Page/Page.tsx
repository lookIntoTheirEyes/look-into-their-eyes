"use client";
import { forwardRef } from "react";
import localStyles from "./Page.module.css";
import Link from "next/link";
import { Page as HeroPage } from "@/lib/utils/heroesService";
import Image from "../../Image/Image";

interface PageProps {
  pageNum: number;
  styles: Record<string, string>;
  rtl: boolean;
  details: HeroPage;
  cta: string;
  title: string;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, styles, rtl, details, cta, title }, ref) => {
    const isRightPage = pageNum % 2 === 0 ? rtl : !rtl;

    return (
      <div
        className={`${styles.page} ${isRightPage ? styles.right : styles.left}`}
        ref={ref}
      >
        <div className={styles.pageContent}>
          <h2 className={localStyles.pageHeader}>{`${title} ${pageNum - 1} - ${
            details.title
          }`}</h2>
          <div className={localStyles.imageSection}>
            <div className={localStyles.pageImage}>
              <Image imageUrl={details.imageUrl!} alt='Sample Image' />
            </div>
          </div>
          <p className={localStyles.pageText}>{details.description}</p>

          <div className={localStyles.pageFooter}>{pageNum}</div>
          <Link
            href={`/story/details?page=${pageNum}`}
            className={`${styles.button} ${localStyles.button}`}
            scroll={false}
          >
            {cta}
          </Link>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
