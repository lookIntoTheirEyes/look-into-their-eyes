import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./header.module.css";
import LanguageInput from "../LanguageInput/LanguageInput";

export default function Header() {
  const t = useTranslations("Header");

  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.nav}>
          <li className={styles.link}>
            <Link href='/'>{t("home")}</Link>
          </li>
          <li className={styles.link}>
            <Link href='/story'>{t("story")}</Link>
          </li>
          <li className={styles.link}>
            <Link href='/about'>{t("about")}</Link>
          </li>
        </ul>
      </nav>
      <LanguageInput />
    </header>
  );
}
