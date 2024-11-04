import { Language } from "@/lib/model/language";
import ModalClient from "@/components/Modal/Modal";
import { getPageNum, SearchParams } from "@/lib/utils/utils";

export async function generateMetadata(
  props: {
    params: Promise<{ locale: Language }>;
    searchParams: Promise<SearchParams>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    locale
  } = params;

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

const ModalPage = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  const page = getPageNum(searchParams);

  return <ModalClient page={+page} />;
};

export default ModalPage;
