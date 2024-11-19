import ModalClient from "../Modal/Modal";
import { IModalProps } from "@/lib/model/book";
import styles from "./CommentForm.module.css";
import StyledButton from "../StyledButton/StyledButton";

// import { redirect } from "@/i18n/routing";

interface CommentFormProps extends Omit<IModalProps, "children"> {
  text: {
    formTitle: string;
    name: string;
    title: string;
    comment: string;
    submit: string;
  };
}

const CommentForm: React.FC<CommentFormProps> = async ({
  lang,
  paths,
  text: { formTitle, name, title, comment, submit },
}) => {
  async function sendEmail(formData: FormData) {
    "use server";

    const comment = {
      title: formData.get("title"),
      instructions: formData.get("comment"),
      creator: formData.get("name"),
    };

    console.log(comment);
    // redirect({ locale: lang, href: paths.next });
  }

  return (
    <ModalClient center paths={paths} lang={lang}>
      <h1 className={styles.formTitle}>{formTitle}</h1>
      <form className={styles.form} action={sendEmail}>
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

        <StyledButton type='submit'>{submit}</StyledButton>
      </form>
    </ModalClient>
  );
};

CommentForm.displayName = "CommentForm";

export default CommentForm;
