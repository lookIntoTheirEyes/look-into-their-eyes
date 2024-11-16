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

const BookComponent: React.FC<Props> = async (props) => {
  const { locale } = await props.params;

  const t = await getTranslations("Story");
  const rtl = locale === Language.he;

  return (
    <PageContainer isStory>
      <Book
        book={{
          front: getFrontPage(locale),
          back: getBackPage(locale),
          pages: getAllPages(locale),
          title: t("title"),
          tocTitle: t("tableOfContents"),
        }}
        rtl={rtl}
        actions={{
          next: t("actions.next"),
          previous: t("actions.previous"),
          cta: t("actions.pageCta"),
        }}
      />
    </PageContainer>
  );
};

export default BookComponent;
