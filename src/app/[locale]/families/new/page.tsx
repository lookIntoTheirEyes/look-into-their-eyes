import { ILanguageProps } from "@/lib/model/language";
import CommentForm from "@/components/CommentForm/CommentForm";
// import { getTranslations } from "next-intl/server";

// export async function generateMetadata(props: IProps) {

//   return {
//     title,
//     description,
//   };
// }

const ModalPage = async (props: ILanguageProps) => {
  const { locale } = await props.params;

  return <CommentForm lang={locale} />;
};
export default ModalPage;
