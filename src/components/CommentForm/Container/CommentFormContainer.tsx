"use client";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";
import { EMAIL, IModalProps } from "@/lib/model/common";
import ModalClient from "@/components/Modal/Modal";
import CommentForm, {
  FormProps,
} from "@/components/CommentForm/Form/CommentForm";

import styles from "./CommentFormContainer.module.css";

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
  const {
    submitHeader,
    success_1,
    success_2,
    success_3,
    genericFormMessage_1,
    genericFormMessage_2,
    error_1,
    error_2,
    error_3,
  } = text.modal;

  const submitView = (
    <div className={styles.confirmation}>
      <p>{genericFormMessage_1}</p>
      <p>{isError ? error_1 : submitHeader}</p>
      {!isError && <p>{success_1}</p>}
      <p>{isError ? error_2 : success_2}</p>
      <p className={styles.mail}>{isError ? error_3 : success_3}</p>
      <a href={`mailto:${EMAIL}`} rel='nofollow'>
        {EMAIL}.
      </a>
      <p>{genericFormMessage_2}</p>
    </div>
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
