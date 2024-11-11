"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./LanguageInput.module.css";
import { Language } from "@/lib/model/language";
import { getUpdatedPath } from "@/lib/utils/utils";

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
      const path = getUpdatedPath(pathname, language, page!);

      router.push(path, {
        scroll: false,
      });
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
