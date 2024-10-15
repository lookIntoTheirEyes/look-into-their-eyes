"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";

export default function LanguageInput() {
  const [, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();

  const onSelectChange = (language: "en" | "he") => {
    startTransition(() => {
      router.replace(getUpdatedPath(pathname, language));
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

function getUpdatedPath(path: string, language: string) {
  const [, , ...route] = path.split("/");
  return `/${language}/${route.join("")}`;
}
