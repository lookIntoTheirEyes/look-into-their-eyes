import { useFormStatus } from "react-dom";
import { sendEmail } from "../actions";

import { CommentFormType } from "@/lib/model/common";
import { FormState } from "@/components/CommentForm/Container/CommentFormContainer";
import StyledButton from "@/components/StyledButton/StyledButton";
import styles from "./CommentForm.module.css";

export interface FormProps {
  text: {
    formTitle: string;
    name: string;
    title: string;
    comment: string;
    submit: string;
    loading: string;
    close: string;
    email: string;
    modal: {
      submitHeader: string;
      success_1: string;
      success_2: string;
      success_3: string;
      genericFormMessage_1: string;
      genericFormMessage_2: string;
      error_1: string;
      error_2: string;
      error_3: string;
    };
  };
  type: CommentFormType;
}

interface IProps extends FormProps {
  setStatus: (state: FormState) => void;
}

export const CommentForm: React.FC<IProps> = ({
  type,
  setStatus,
  text: { name, title, comment, submit, loading, email },
}) => {
  const { pending } = useFormStatus();

  return (
    <form
      className={styles.form}
      onSubmit={async (ev) => {
        ev.preventDefault();

        if (!ev.currentTarget.checkValidity()) {
          return;
        }

        const formData = new FormData(ev.currentTarget);
        const comment = {
          title: formData.get("title") as string,
          comment: formData.get("comment") as string,
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          type,
        };
        try {
          await sendEmail(comment);
          setStatus(FormState.SUCCESS);
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
        <label htmlFor='email'>{email}</label>
        <input type='email' id='email' name='email' />
      </p>

      <p>
        <label htmlFor='comment'>{comment}</label>
        <textarea id='comment' name='comment' rows={10} required></textarea>
      </p>

      <StyledButton center type={pending ? "button" : "submit"}>
        {pending ? loading : submit}
      </StyledButton>
    </form>
  );
};

CommentForm.displayName = "CommentForm";
export default CommentForm;
