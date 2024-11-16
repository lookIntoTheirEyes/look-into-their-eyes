"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";
import { Language } from "@/lib/model/language";
import { useRouter, usePathname } from "@/i18n/routing";

export default function LanguageInput({ locale }: { locale: Language }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const isParallelRoute = pathname.includes("details");

  const onSelectChange = (language: Language) => {
    if (isPending || isParallelRoute) {
      return;
    }

    startTransition(() => {
      router.replace({ pathname, query: { page } }, { locale: language });
    });
  };

  return (
    <div className={styles.container}>
      {
        <span
          className={`${styles.language} ${
            isParallelRoute ? styles.disabled : ""
          }`}
          onClick={() =>
            onSelectChange(locale === Language.en ? Language.he : Language.en)
          }
          aria-disabled={isParallelRoute}
        >
          {locale === Language.he ? "English" : "עברית"}
        </span>
      }
    </div>
  );
}
