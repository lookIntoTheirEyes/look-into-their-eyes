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

  const formText = "visitors.form.";

  const text = {
    formTitle: t(`${formText}formTitle`),
    name: t(`${formText}name`),
    title: t(`${formText}title`),
    comment: t(`${formText}comment`),
    submit: t(`${formText}submit`),
    loading: t(`${formText}loading`),
    email: t(`${formText}email`),
    close: t("actions.closeText"),
    modal: {
      submitHeader: t(`${formText}submitHeader`),
      success_1: t(`${formText}success_1`),
      success_2: t(`${formText}success_2`),
      success_3: t(`${formText}success_3`),
      success_4: t(`${formText}success_4`),
      success_5: t(`${formText}success_5`),
    },
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
