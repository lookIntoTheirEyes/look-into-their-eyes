import { useTranslations } from "next-intl";

import styles from "./header.module.css";
import LanguageInput from "../LanguageInput/LanguageInput";
import NavLink from "../NavLink/NavLink";

export default function Header() {
  const t = useTranslations("Header");

  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.nav}>
          <li className={styles.link}>
            <NavLink href='/'>{t("home")}</NavLink>
          </li>
          <li className={styles.link}>
            <NavLink href='story'>{t("story")}</NavLink>
          </li>
          <li className={styles.link}>
            <NavLink href='about'>{t("about")}</NavLink>
          </li>
        </ul>
      </nav>
      <LanguageInput />
    </header>
  );
}
