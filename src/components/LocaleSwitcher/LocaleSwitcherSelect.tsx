"use client";

import { ChangeEvent, ReactNode, useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import styles from "./LocaleSwitcherSelect.module.css";
import { Locale } from "next-intl";

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as Locale;

    startTransition(() => {
      const currentUrl = new URL(window.location.href);
      const currentParams = Object.fromEntries(
        currentUrl.searchParams.entries()
      );

      router.push(
        {
          pathname,
          query: currentParams,
        },
        {
          locale,
          scroll: false,
        }
      );
    });
  }

  return (
    <label className={styles.container}>
      <p className={styles.label}>{label}</p>
      <select
        className={styles.select}
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={onSelectChange}
      >
        {children}
      </select>
    </label>
  );
}
