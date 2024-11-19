import ModalClient from "../Modal/Modal";
import { IModalProps } from "@/lib/model/book";

interface CommentFormProps extends Omit<IModalProps, "children"> {}

const CommentForm: React.FC<CommentFormProps> = ({ lang, paths }) => {
  return (
    <ModalClient paths={paths} lang={lang}>
      <p>comment</p>
    </ModalClient>
  );
};

CommentForm.displayName = "CommentForm";

export default CommentForm;
