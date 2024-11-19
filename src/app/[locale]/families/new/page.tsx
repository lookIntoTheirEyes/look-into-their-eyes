import { getTranslations } from "next-intl/server";
import { ILanguageProps } from "@/lib/model/language";
import CommentForm from "@/components/CommentForm/CommentForm";

// export async function generateMetadata(props: IProps) {

//   return {
//     title,
//     description,
//   };
// }

const ModalPage = async (props: ILanguageProps) => {
  const { locale } = await props.params;
  const t = await getTranslations("Book.families.form");

  const text = {
    formTitle: t("formTitle"),
    name: t("name"),
    title: t("title"),
    comment: t("comment"),
    submit: t("submit"),
    cancel: t("cancel"),
    loading: t("loading"),
  };

  return (
    <CommentForm
      type='family'
      text={text}
      paths={{ curr: "/families/new", next: "/families" }}
      lang={locale}
    />
  );
};
export default ModalPage;
