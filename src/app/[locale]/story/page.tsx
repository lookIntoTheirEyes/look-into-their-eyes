import React from "react";

import styles from "./page.module.css";
import Book from "@/components/Book/Book";

const BookComponent: React.FC = () => {
  return (
    <div className={styles.bookContainer}>
      <Book />
    </div>
  );
};

export default BookComponent;
