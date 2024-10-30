import React, { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Language } from "@/app/model/language";
import Book from "@/components/Book/Book";
import styles from "./page.module.css";

const pagesContent = (isRtl = false) =>
  isRtl
    ? [
        "הסיפור שלי",
        "מתחיל כאן בעמוד 2",
        "עמוד 3",
        "עמוד 4",
        "עמוד 5",
        "עמוד 6",
        "עמוד 7",
        "עמוד 8",
        "עמוד 9",
        "תודה נתי",
      ].reverse()
    : [
        "My Story",
        "Once upon a time, there was a little girl.",
        "She loved exploring the woods.",
        "One day, she found a hidden path.",
        "Curiosity led her down the trail.",
        "She discovered a secret garden.",
        "In the garden, she met a talking rabbit.",
        "They became the best of friends.",
        "Together, they went on many adventures.",
        "Thank you, Nati.",
      ];

const BookComponent: React.FC<{
  children: ReactNode;
  params: { locale: Language };
}> = ({ params: { locale }, children }) => {
  const t = useTranslations("Story");
  const rtl = locale === Language.he;

  return (
    <>
      {children}
      <div className={styles.storyContainer}>
        <Book
          book={{
            front: rtl ? "הסוף" : "BOOK TITLE",
            back: rtl ? "ההתחלה" : "THE END",
            pages: pagesContent(locale === Language.he),
          }}
          rtl={rtl}
          actions={{
            next: t("next"),
            previous: t("previous"),
          }}
        />
      </div>
    </>
  );
};

export default BookComponent;
