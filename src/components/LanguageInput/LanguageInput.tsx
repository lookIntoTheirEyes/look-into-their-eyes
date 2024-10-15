"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";

export default function LanguageInput() {
  const [_, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();

  const onSelectChange = (language: "en" | "he") => {
    startTransition(() => {
      router.replace(`/${language}`);
    });
  };
  return (
    <div className={styles.container}>
      <span
        className={`${styles.language} ${
          localActive === "he" ? styles.active : ""
        }`}
        onClick={() => onSelectChange("he")}
      >
        עב
      </span>
      <span
        className={`${styles.language} ${
          localActive === "en" ? styles.active : ""
        }`}
        onClick={() => onSelectChange("en")}
      >
        EN
      </span>
    </div>
  );
}
