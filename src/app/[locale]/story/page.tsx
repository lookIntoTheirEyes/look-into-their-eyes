import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import BookContainer from "@/components/Book/BookContainer";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import { getAllPages, getHero } from "@/lib/utils/heroesService";

interface IProps extends ILanguageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: IProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale } = params;
  const pageNum = getPageNum(searchParams);
  try {
    const { name: title, description } = await getHero(pageNum, locale);

    return {
      title,
      description,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    const t = await getTranslations("Metadata");

    const title = t("layout.title");
    const description = t("layout.description");

    return {
      title,
      description,
    };
  }
}

const BookComponent: React.FC<IProps> = async (props) => {
  const { locale } = await props.params;

  const bookPages = getAllPages(locale);
  const rtl = locale === Language.he;

  return <BookContainer rtl={rtl} pagesContent={bookPages} />;
};

export default BookComponent;
