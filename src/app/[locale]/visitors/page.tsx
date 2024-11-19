import UsersBook from "@/components/UsersBook/UsersBook";
import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";

const Visitors: React.FC<ILanguageProps> = async (props) => {
  const { locale } = await props.params;
  const rtl = locale === Language.he;

  const t = await getTranslations("Book");
  const title = t("visitors.front.title");
  const newText = t("visitors.new");

  return (
    <UsersBook
      newPath='/visitors/new'
      newText={newText}
      title={title}
      rtl={rtl}
    />
  );
};

Visitors.displayName = "Families";
export default Visitors;
