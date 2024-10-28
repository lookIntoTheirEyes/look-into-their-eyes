import React from "react";
import styles from "./Dialog.module.css";

const Dialog: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2>Dialog</h2>
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Dialog;
