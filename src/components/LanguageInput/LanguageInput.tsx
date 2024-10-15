"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";
import { Language } from "@/app/model/language";

export default function LanguageInput() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();

  const onSelectChange = () => {
    if (isPending) {
      return;
    }
    const nextRouteLang =
      localActive === Language.en ? Language.he : Language.en;

    startTransition(() => {
      router.replace(getUpdatedPath(pathname, nextRouteLang));
    });
  };

  return (
    <div className={styles.container}>
      {
        <span className={styles.language} onClick={onSelectChange}>
          {localActive === Language.he ? "עברית" : "English"}
        </span>
      }
    </div>
  );
}

function getUpdatedPath(path: string, language: string) {
  const [, , ...route] = path.split("/");
  return `/${language}/${route.join("")}`;
}
