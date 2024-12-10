import UsersBook from "@/components/UsersBook/UsersBook";
import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

const Visitors: React.FC<ILanguageProps> = async (props) => {
  const { locale } = await props.params;
  const rtl = locale === Language.he;
  const isMobile = (await cookies()).get("isMobile")?.value === "true";

  const t = await getTranslations("Book");
  const title = t("visitors.front.title");
  const newText = t("visitors.new");

  const noCommentsText = `${t("common.no_comments_1")} ${t(
    "visitors.form.no_comments_2"
  )} ${t("common.no_comments_3")}`;

  return (
    <UsersBook
      newPath='/visitors/new'
      newText={newText}
      title={title}
      rtl={rtl}
      isMobile={isMobile}
      noCommentsText={noCommentsText}
    />
  );
};

Visitors.displayName = "Families";
export default Visitors;
