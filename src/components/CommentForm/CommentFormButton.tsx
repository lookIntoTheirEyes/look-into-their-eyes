"use client";

import StyledButton from "../StyledButton/StyledButton";
import { useFormStatus } from "react-dom";

const FormButton: React.FC<{
  submit: string;
  loading: string;
}> = ({ submit, loading }) => {
  const { pending } = useFormStatus();

  return (
    <StyledButton center={false} type={pending ? "button" : "submit"}>
      {pending ? loading : submit}
    </StyledButton>
  );
};
FormButton.displayName = "FormButton";
export default FormButton;
