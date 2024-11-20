"use client";
import { useEffect, useState } from "react";
import { IModalProps } from "@/lib/model/book";
import ModalClient from "@/components/Modal/Modal";
import CommentForm, {
  FormProps,
} from "@/components/CommentForm/Form/CommentForm";

import styles from "./CommentFormContainer.module.css";
import { usePathname } from "@/i18n/routing";

export const FormState = {
  NOT_SUBMITTED: 1,
  SUCCESS: 2,
  ERROR: 3,
} as const;

export type FormState = (typeof FormState)[keyof typeof FormState];

interface CommentFormProps extends Omit<IModalProps, "children">, FormProps {}

const CommentFormContainer: React.FC<CommentFormProps> = ({
  lang,
  paths,
  text,
  type,
}) => {
  const [submitStatus, setSubmitStatus] = useState<FormState>(
    FormState.NOT_SUBMITTED
  );
  const path = usePathname();

  const isError = submitStatus === FormState.ERROR;

  const submitView = (
    <>
      <p>Thank you for providing your {isError ? "error" : "comment"}</p>
      <p>
        We will review your comment/share and make sure it follows our guidlines
        before we add it
      </p>
      <p>If you have any questions feel free to contact us at</p>
      <a href='mailto:look.into.their.eyes.0710@gmail.com' rel='nofollow'>
        look.into.their.eyes.0710@gmail.com
      </a>
    </>
  );

  useEffect(() => {
    return () => {
      setSubmitStatus(FormState.NOT_SUBMITTED);
    };
  }, [path]);

  return (
    <ModalClient
      closeText={submitStatus !== FormState.NOT_SUBMITTED ? text.close : ""}
      center
      paths={paths}
      lang={lang}
    >
      <h1 className={styles.formTitle}>{text.formTitle}</h1>
      {submitStatus === FormState.NOT_SUBMITTED ? (
        <CommentForm setStatus={setSubmitStatus} type={type} text={text} />
      ) : (
        submitView
      )}
    </ModalClient>
  );
};

CommentFormContainer.displayName = "CommentFormContainer";

export default CommentFormContainer;
