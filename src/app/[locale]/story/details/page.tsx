import { ILanguageProps } from "@/lib/model/language";
import ModalClient from "@/components/Modal/Modal";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import PageContainer from "@/components/PageContainer/PageContainer";
import { getHero } from "@/lib/utils/heroesService";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("Story");

  const { locale } = params;
  try {
    const {
      name: title,
      longDescription,
      imageUrls,
    } = await getHero(pageNum, locale);

    return (
      <PageContainer isStory>
        <ModalClient
          closeText={t("closeText")}
          lang={locale}
          page={+pageNum}
          title={title}
          description={longDescription}
          imageUrls={imageUrls}
        />
      </PageContainer>
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    redirect("/story");
  }
};

export default ModalPage;
