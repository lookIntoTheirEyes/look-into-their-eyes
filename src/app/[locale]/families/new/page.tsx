import { ILanguageProps } from "@/lib/model/language";
import CommentForm from "@/components/CommentForm/CommentForm";

// export async function generateMetadata(props: IProps) {

//   return {
//     title,
//     description,
//   };
// }

const ModalPage = async (props: ILanguageProps) => {
  const params = await props.params;
  // const t = await getTranslations("Book.actions");

  const { locale } = params;

  return (
    <CommentForm
      lang={locale}
      paths={{ curr: "/families", next: "/families" }}
    />
  );
};
export default ModalPage;
