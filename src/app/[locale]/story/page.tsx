import { use } from "react";
import { useTranslations } from "next-intl";
import { Language } from "@/lib/model/language";
import Book from "@/components/Book/Book";
import styles from "./page.module.css";
import { ensurePromise } from "@/lib/utils/utils";
import PageContainer from "@/components/PageContainer/PageContainer";

interface Props {
  params: Params;
}

type Params = {
  locale: Language;
};

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

const BookComponent: React.FC<Props> = (props) => {
  const { locale } = use<Params>(ensurePromise(props.params));

  const t = useTranslations("Story");
  const rtl = locale === Language.he;

  return (
    <PageContainer lang={locale} isStory>
      <div className={styles.storyContainer}>
        <Book
          book={{
            front: rtl ? "הסוף" : "BOOK TITLE",
            back: rtl ? "ההתחלה" : "THE END",
            pages: pagesContent(rtl),
          }}
          rtl={rtl}
          actions={{
            next: t("next"),
            previous: t("previous"),
          }}
        />
      </div>
    </PageContainer>
  );
};

export default BookComponent;
