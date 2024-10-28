import { useLocale, useTranslations } from "next-intl";
import styles from "./header.module.css";

import LanguageInput from "../LanguageInput/LanguageInput";

import { Language } from "@/app/model/language";
import Nav from "../Nav/Nav";

export default function Header() {
  const t = useTranslations("Header");
  const locale = useLocale() as Language;

  return (
    <header className={styles.header}>
      <Nav routes={{ home: t("home"), story: t("story"), about: t("about") }} />
      <LanguageInput locale={locale} />
    </header>
  );
}
