"use client";
import { forwardRef } from "react";
import localStyles from "./Page.module.css";
import Link from "next/link";
import { Page as HeroPage } from "@/lib/utils/heroesService";
import Image from "../Image/Image";

interface PageProps {
  pageNum: number;
  styles: Record<string, string>;
  rtl: boolean;
  details: HeroPage;
}

const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ pageNum, styles, rtl, details }, ref) => {
    const isRightPage = pageNum % 2 === 0 ? rtl : !rtl;

    return (
      <div
        className={`${styles.page} ${isRightPage ? styles.right : styles.left}`}
        ref={ref}
      >
        <div className={styles.pageContent}>
          <h2 className={localStyles.pageHeader}>{details.title}</h2>
          <div className={localStyles.pageImage}>
            <Image imageUrl={details.imageUrl!} alt='Sample Image' />
          </div>
          <p className={localStyles.pageText}>{details.description}</p>

          <div className={localStyles.pageFooter}>{pageNum}</div>
          <Link
            href={`/story/details?page=${pageNum}`}
            className={styles.button}
            scroll={false}
          >
            {rtl ? "המשך לקרוא" : "read more"}
          </Link>
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default Page;
