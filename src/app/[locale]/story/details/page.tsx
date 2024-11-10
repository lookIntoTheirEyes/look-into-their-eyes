import { Language } from "@/lib/model/language";
import ModalClient from "@/components/Modal/Modal";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import PageContainer from "@/components/PageContainer/PageContainer";
import { getHero } from "@/lib/utils/heroesService";
import { redirect } from "next/navigation";

interface IProps {
  params: Promise<{ locale: Language }>;
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

  const { locale } = params;
  try {
    const { name: title, longDescription } = await getHero(pageNum, locale);

    return (
      <PageContainer isStory lang={locale}>
        <ModalClient
          page={+pageNum}
          title={title}
          description={longDescription}
        />
      </PageContainer>
    );
  } catch (error) {
    redirect("/story");
  }
};

export default ModalPage;
