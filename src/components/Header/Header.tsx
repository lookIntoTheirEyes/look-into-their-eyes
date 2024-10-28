import { useLocale, useTranslations } from "next-intl";
import styles from "./header.module.css";

import LanguageInput from "../LanguageInput/LanguageInput";
import NavLink from "../NavLink/NavLink";
import { Language } from "@/app/model/language";
import { Pathnames } from "@/i18n/routing";

export default function Header() {
  const t = useTranslations("Header");
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

function getRoute(
  href: { pathname: Pathnames; query?: Record<string, string | number> },
  name: string
) {
  return { href, name };
}
