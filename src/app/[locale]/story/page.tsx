import React from "react";

import styles from "./page.module.css";
import Book from "@/components/Book/Book";
import { Language } from "@/app/model/language";
import { useTranslations } from "next-intl";

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

const BookComponent: React.FC<{ params: { locale: Language } }> = ({
  params: { locale },
}) => {
  const t = useTranslations("Story");
  const rtl = locale === Language.he;
  return (
    <div className={styles.storyContainer}>
      <Book
        book={{
          front: rtl ? "הסוף" : "THE END",
          back: rtl ? "ההתחלה" : "BOOK TITLE",
          pages: pagesContent(locale === Language.he),
        }}
        rtl
        actions={{
          next: t("next"),
          previous: t("previous"),
        }}
      />
    </div>
  );
};

export default BookComponent;
