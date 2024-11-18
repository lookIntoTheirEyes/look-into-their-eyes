import ModalClient from "@/components/Modal/Modal";
import { ILanguageProps } from "@/lib/model/language";
import { getHero } from "@/lib/utils/heroesService";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

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
  try {
    const {
      name: title,
      longDescription,
      imageUrls,
    } = await getHero(pageNum, locale);

    return (
      <ModalClient
        lang={locale}
        page={+pageNum}
        title={title}
        description={longDescription}
        imageUrls={imageUrls}
        closeText={t("closeText")}
      />
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    redirect("/story");
  }
};

export default HeroDetails;
