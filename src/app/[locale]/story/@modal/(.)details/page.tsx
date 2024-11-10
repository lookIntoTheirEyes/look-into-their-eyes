import ModalClient from "@/components/Modal/Modal";
import { Language } from "@/lib/model/language";
import { getHero } from "@/lib/utils/heroesService";
import { getPageNum, SearchParams } from "@/lib/utils/utils";
import { redirect } from "next/navigation";

interface IProps {
  params: Promise<{ locale: Language }>;
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

  const { locale } = params;
  try {
    const {
      name: title,
      longDescription,
      imageUrl,
    } = await getHero(pageNum, locale);

    return (
      <ModalClient
        page={+pageNum}
        title={title}
        description={longDescription}
        imageUrl={imageUrl}
      />
    );
  } catch (error) {
    redirect("/story");
  }
};

export default HeroDetails;
