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

  const onSelectChange = (language: Language) => {
    if (isPending) {
      return;
    }

    startTransition(() => {
      const query = page ? { query: { page } } : {};
      router.replace(
        { pathname, ...query },
        { locale: language, scroll: false }
      );
    });
  };

  return (
    <div className={styles.container}>
      {
        <span
          className={`${styles.language}`}
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
