"use client";

import StyledButton from "../StyledButton/StyledButton";
import { useFormStatus } from "react-dom";

const FormButton: React.FC<{
  submit: string;
  cancel: string;
  loading: string;
}> = ({ submit, cancel, loading }) => {
  const state = useFormStatus();

  if (state.pending) {
    return <StyledButton center={false}>{loading}...</StyledButton>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <StyledButton>{cancel}</StyledButton>
      <StyledButton type='submit'>{submit}</StyledButton>
    </div>
  );
};
FormButton.displayName = "FormButton";
export default FormButton;
