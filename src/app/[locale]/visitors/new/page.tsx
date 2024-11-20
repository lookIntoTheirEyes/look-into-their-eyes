import { getTranslations } from "next-intl/server";
import { ILanguageProps } from "@/lib/model/language";
import CommentFormContainer from "@/components/CommentForm/Container/CommentFormContainer";

// export async function generateMetadata(props: IProps) {

//   return {
//     title,
//     description,
//   };
// }

const ModalPage = async (props: ILanguageProps) => {
  const { locale } = await props.params;
  const t = await getTranslations("Book");

  const formText = "families.form.";

  const text = {
    formTitle: t(`${formText}formTitle`),
    name: t(`${formText}name`),
    title: t(`${formText}title`),
    comment: t(`${formText}comment`),
    submit: t(`${formText}submit`),
    loading: t(`${formText}loading`),
    close: t("actions.closeText"),
  };

  return (
    <CommentFormContainer
      type='visitor'
      text={text}
      paths={{ curr: "/visitors/new", next: "/visitors" }}
      lang={locale}
    />
  );
};
export default ModalPage;
