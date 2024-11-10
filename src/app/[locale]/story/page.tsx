import { Language } from "@/lib/model/language";
import Book from "@/components/Book/Book";
import PageContainer from "@/components/PageContainer/PageContainer";
import {
  getAllPages,
  getBackPage,
  getFrontPage,
} from "@/lib/utils/heroesService";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<Params>;
}

type Params = {
  locale: Language;
};

const pagesContent = (lang: Language) => getAllPages(lang);

const BookComponent: React.FC<Props> = async (props) => {
  const { locale } = await props.params;

  const t = await getTranslations("Story");
  const rtl = locale === Language.he;

  return (
    <PageContainer lang={locale} isStory isCoolFont={rtl}>
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
    </PageContainer>
  );
};

export default BookComponent;
