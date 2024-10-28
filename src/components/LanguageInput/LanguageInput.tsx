"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";
import { Language } from "@/app/model/language";

export default function LanguageInput({ locale }: { locale: Language }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (language: Language) => {
    if (isPending) {
      return;
    }

    startTransition(() => {
      router.replace(getUpdatedPath(pathname, language));
    });
  };

  return (
    <div className={styles.container}>
      {
        <span
          className={styles.language}
          onClick={() =>
            onSelectChange(locale === Language.en ? Language.he : Language.en)
          }
        >
          {locale === Language.he ? "English" : "עברית"}
        </span>
      }
    </div>
  );
}

function getUpdatedPath(path: string, language: string) {
  const [, , ...route] = path.split("/");

  return `/${language}/${route.join("/")}`;
}
