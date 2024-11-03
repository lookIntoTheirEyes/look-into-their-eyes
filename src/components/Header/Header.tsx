import { useLocale, useTranslations } from "next-intl";
import styles from "./header.module.css";

import LanguageInput from "../LanguageInput/LanguageInput";
import NavLink from "../NavLink/NavLink";
import { Language } from "@/lib/model/language";
import { getRoute } from "@/lib/utils/utils";

export default function Header() {
  const t = useTranslations("Links");
  const locale = useLocale();

  const links = [
    getRoute({ pathname: "/" }, t("home")),
    getRoute({ pathname: "/story", query: { page: 1 } }, t("story")),
    getRoute({ pathname: "/about" }, t("about")),
  ].map(({ href, name }) => (
    <li key={name} className={styles.link}>
      <NavLink href={href}>{name}</NavLink>
    </li>
  ));

  return (
    <header className={styles.header}>
      <nav>
        <ul className={styles.nav}>{links}</ul>
      </nav>
      <LanguageInput locale={locale as Language} />
    </header>
  );
}
