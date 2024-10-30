"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";
import { Language } from "@/app/model/language";

export default function LanguageInput({ locale }: { locale: Language }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");

  const onSelectChange = (language: Language) => {
    if (isPending) {
      return;
    }

    startTransition(() => {
      router.replace(getUpdatedPath(pathname, language, page!), {
        scroll: false,
      });
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

function getUpdatedPath(path: string, language: string, page = "") {
  const [, , ...route] = path.split("/");

  return `/${language}/${route.join("/")}${page ? `?page=${page}` : ""}`;
}
