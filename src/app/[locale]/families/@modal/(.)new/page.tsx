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
    email: t(`${formText}email`),
    close: t("common.closeText"),
    modal: {
      submitHeader: t(`${formText}submitHeader`),
      success_1: t(`${formText}success_1`),
      success_2: t(`${formText}success_2`),
      success_3: t(`${formText}success_3`),
      error_3: t(`${formText}error_3`),
      genericFormMessage_1: t(`common.genericFormMessage_1`),
      genericFormMessage_2: t(`common.genericFormMessage_2`),
      error_1: t(`common.error_1`),
      error_2: t(`common.error_2`),
    },
  };

  return (
    <CommentFormContainer
      type='family'
      text={text}
      paths={{ curr: "/families/new", next: "/families" }}
      lang={locale}
    />
  );
};

export default ModalPage;
