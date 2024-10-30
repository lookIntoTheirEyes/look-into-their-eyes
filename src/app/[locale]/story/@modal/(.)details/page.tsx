import { Language } from "@/lib/model/language";
import ModalClient from "@/components/Modal/Modal";
import { getPageNum, SearchParams } from "@/lib/utils/utils";

export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Language };
  searchParams: SearchParams;
}) {
  const page = getPageNum(searchParams);

  const title =
    locale === Language.en
      ? `${page} Look in their eyes"`
      : `${page} הסתכלו להם בעיניים`;
  const description =
    locale === Language.en ? "Look in their eyes" : "הסתכלו להם בעיניים";

  return {
    title,
    description,
  };
}

const HeroDetails = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const page = getPageNum(searchParams);

  return <ModalClient page={+page} />;
};

export default HeroDetails;
