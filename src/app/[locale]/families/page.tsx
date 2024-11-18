import UsersBook from "@/components/UsersBook/UsersBook";
import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";

const Families: React.FC<ILanguageProps> = async (props) => {
  const { locale } = await props.params;
  const rtl = locale === Language.he;

  const t = await getTranslations("Book");
  const title = t("families.front.title");

  return <UsersBook title={title} rtl={rtl} />;
};

Families.displayName = "Families";
export default Families;
