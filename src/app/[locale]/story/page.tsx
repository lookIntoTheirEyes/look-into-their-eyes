import { use } from "react";
import { useTranslations } from "next-intl";
import { Language } from "@/lib/model/language";
import Book from "@/components/Book/Book";
import styles from "./page.module.css";
import { ensurePromise } from "@/lib/utils/utils";
import PageContainer from "@/components/PageContainer/PageContainer";
import {
  getAllPages,
  getBackPage,
  getFrontPage,
} from "@/lib/utils/heroesService";

interface Props {
  params: Params;
}

type Params = {
  locale: Language;
};

const pagesContent = (lang: Language) => getAllPages(lang);

const BookComponent: React.FC<Props> = (props) => {
  const { locale } = use<Params>(ensurePromise(props.params));

  const t = useTranslations("Story");
  const rtl = locale === Language.he;

  return (
    <PageContainer lang={locale} isStory>
      <div className={styles.storyContainer}>
        <Book
          book={{
            front: getFrontPage(locale),
            back: getBackPage(locale),
            pages: pagesContent(locale),
          }}
          rtl={rtl}
          actions={{
            next: t("actions.next"),
            previous: t("actions.previous"),
          }}
        />
      </div>
    </PageContainer>
  );
};

export default BookComponent;
