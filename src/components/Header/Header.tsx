import { useTranslations } from "next-intl";
import Link from "next/link";
// import BringThemHomeTicker from "../BringThemHomeTicker";
import { Language } from "@/app/model/language";
import styles from "./header.module.css";

export default function Header({ lang }: { lang: Language }) {
  const t = useTranslations("Header");

  return (
    <header className={styles.header}>
      {/* <BringThemHomeTicker lang={lang} /> */}
      <p>{`ticker ${lang}`}</p>
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
    </header>
  );
}
