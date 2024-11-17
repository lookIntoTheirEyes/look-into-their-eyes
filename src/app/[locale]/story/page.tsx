import { Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import BookContainer from "@/components/Book/BookContainer";

interface Props {
  params: Promise<Params>;
}

type Params = {
  locale: Language;
};

const BookComponent: React.FC<Props> = async (props) => {
  const { locale } = await props.params;
  const t = await getTranslations("Story");

  return (
    <BookContainer
      locale={locale}
      text={{
        tableOfContentsTitle: t("tableOfContents"),
        pageCta: t("actions.pageCta"),
        pageTitle: t("title"),
        next: t("actions.next"),
        previous: t("actions.previous"),
      }}
    />
  );
};

export default BookComponent;
