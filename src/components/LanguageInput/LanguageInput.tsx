"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ChangeEvent, useTransition } from "react";

export default function LanguageInput({
  languages: { hebrew, english },
}: {
  languages: { hebrew: string; english: string };
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(`/${nextLocale}`);
    });
  };
  return (
    <label>
      <p>change language</p>
      <select
        defaultValue={localActive}
        onChange={onSelectChange}
        disabled={isPending}
      >
        <option value='en'>{english}</option>
        <option value='he'>{hebrew}</option>
      </select>
    </label>
  );
}
