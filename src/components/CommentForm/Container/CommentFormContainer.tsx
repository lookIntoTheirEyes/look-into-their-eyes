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
    FormState.SUCCESS
  );
  const path = usePathname();

  const isError = submitStatus === FormState.ERROR;
  const {
    submitHeader,
    success_1,
    success_2,
    success_3,
    success_4,
    success_5,
  } = text.modal;

  const submitView = (
    <div className={styles.confirmation}>
      <p>{submitHeader}</p>
      <p>{success_1}</p>
      <p>{success_2}</p>
      <p>{success_3}</p>
      <div className={styles.mail}>
        <p>{success_4}</p>
        <a href='mailto:look.into.their.eyes.0710@gmail.com' rel='nofollow'>
          look.into.their.eyes.0710@gmail.com
        </a>
      </div>
      <p>{success_5}</p>
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
