import { useFormStatus } from "react-dom";
import { sendEmail } from "../actions";

import styles from "./CommentForm.module.css";
import { FormState } from "../Container/CommentFormContainer";
import StyledButton from "@/components/StyledButton/StyledButton";
import { CommentFormType } from "@/lib/model/language";

export interface FormProps {
  text: {
    formTitle: string;
    name: string;
    title: string;
    comment: string;
    submit: string;
    loading: string;
    close: string;
  };
  type: CommentFormType;
}

interface IProps extends FormProps {
  setStatus: (state: FormState) => void;
}

export const CommentForm: React.FC<IProps> = ({
  type,
  setStatus,
  text: { name, title, comment, submit, loading },
}) => {
  const { pending } = useFormStatus();
  const sendEmailWithType = sendEmail.bind(null, type);

  return (
    <form
      className={styles.form}
      onSubmit={async (ev) => {
        ev.preventDefault();
        const formData = new FormData(ev.currentTarget);
        try {
          await sendEmailWithType(formData);
          setStatus(FormState.SUCCESS);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          console.error(error);
          setStatus(FormState.ERROR);
        }
      }}
    >
      <p>
        <label htmlFor='name'>{name}</label>
        <input type='text' id='name' name='name' required />
      </p>

      <p>
        <label htmlFor='title'>{title}</label>
        <input type='text' id='title' name='title' required />
      </p>

      <p>
        <label htmlFor='comment'>{comment}</label>
        <textarea id='comment' name='comment' rows={10} required></textarea>
      </p>

      <StyledButton center={false} type={pending ? "button" : "submit"}>
        {pending ? loading : submit}
      </StyledButton>
    </form>
  );
};

CommentForm.displayName = "CommentForm";
export default CommentForm;
