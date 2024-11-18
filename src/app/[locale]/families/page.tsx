import BookContainer from "@/components/Book/BookContainer";
import PageCover from "@/components/Book/PageCover/PageCover";
import { ILanguageProps, Language } from "@/lib/model/language";
import { Page as BookPage } from "@/lib/utils/heroesService";
import { getTranslations } from "next-intl/server";

const Families: React.FC<ILanguageProps> = async (props) => {
  const params = await props.params;
  const { locale } = params;
  const rtl = locale === Language.he;

  const t = await getTranslations("Book");
  const title = t("families.front.title");

  const frontDetails = {
    title,
    // description: t("story.front.description"),
    // longDescription: t("story.front.longDescription"),
  };

  const Front = rtl ? undefined : <PageCover details={frontDetails} />;
  const Back = rtl ? <PageCover details={frontDetails} /> : undefined;

  const Pages = [] as JSX.Element[];
  const pagesContent = [] as BookPage[];

  return (
    <>
      <BookContainer
        pagesContent={pagesContent}
        Pages={Pages}
        rtl={rtl}
        Front={Front}
        Back={Back}
        noContentAmount={1}
      >
        <h1>{title}</h1>
      </BookContainer>
    </>
  );
};

Families.displayName = "Families";
export default Families;
