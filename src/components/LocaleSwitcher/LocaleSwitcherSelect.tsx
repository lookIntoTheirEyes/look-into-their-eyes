"use client";

import { useSearchParams } from "next/navigation";
import { ChangeEvent, ReactNode, useTransition } from "react";
import { Locale, usePathname, useRouter } from "@/i18n/routing";
import styles from "./LocaleSwitcherSelect.module.css";

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

  const searchParams = useSearchParams();
  const page = searchParams.get("page");

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const locale = event.target.value as Locale;

    startTransition(() => {
      const query = page ? { query: { page } } : {};
      router.push({ pathname, ...query }, { locale, scroll: false });
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
