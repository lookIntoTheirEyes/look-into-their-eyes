import { getTranslations } from "next-intl/server";
import StoryModal from "@/components/Book/Modal/Modal";
import { ILanguageProps } from "@/lib/model/language";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import { getHero } from "@/lib/utils/heroesService";

interface IProps extends ILanguageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: IProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { locale } = params;
  const { name: title, description } = await getHero(
    getPageNum(searchParams),
    locale
  );

  return {
    title,
    description,
  };
}

const ModalPage = async (props: IProps) => {
  const searchParams = await props.searchParams;
  const pageNum = getPageNum(searchParams);
  const params = await props.params;
  const t = await getTranslations("Book.common");

  const { locale } = params;

  return (
    <>
      <StoryModal closeText={t("closeText")} lang={locale} pageNum={pageNum} />
    </>
  );
};

export default ModalPage;
