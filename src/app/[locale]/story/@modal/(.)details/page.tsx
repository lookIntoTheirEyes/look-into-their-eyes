import { getTranslations } from "next-intl/server";
import StoryModal from "@/components/Book/Modal/Modal";
import { ILanguageProps } from "@/lib/model/language";
import { getHero } from "@/lib/utils/heroesService";
import { getPageNum, SearchParams } from "@/lib/utils/utils";

interface IProps extends ILanguageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata(props: IProps) {
  const searchParams = await props.searchParams;
  const pageNum = getPageNum(searchParams);
  const params = await props.params;

  const { locale } = params;

  const { name: title, description } = await getHero(pageNum, locale);

  return {
    title,
    description,
  };
}

const HeroDetails = async (props: IProps) => {
  const searchParams = await props.searchParams;
  const pageNum = getPageNum(searchParams);
  const params = await props.params;
  const t = await getTranslations("Book.actions");

  const { locale } = params;

  return (
    <StoryModal
      lang={locale}
      pageNum={pageNum}
      closeText={t("closeText")}
    ></StoryModal>
  );
};

export default HeroDetails;
