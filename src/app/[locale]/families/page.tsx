import UsersBook from "@/components/UsersBook/UsersBook";
import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";

const Families: React.FC<ILanguageProps> = async (props) => {
  const { locale } = await props.params;
  const rtl = locale === Language.he;

  const t = await getTranslations("Book");
  const title = t("families.front.title");
  const newText = t("families.new");

  return (
    <UsersBook
      newPath='/families/new'
      newText={newText}
      title={title}
      rtl={rtl}
    />
  );
};

Families.displayName = "Families";
export default Families;
