import { useTranslations } from "next-intl";
import styles from "./Footer.module.css";
import { Language } from "@/lib/model/language";
import Link from "next/link";

export default function Footer({ locale }: { locale: Language }) {
  const isRTL = locale === Language.he;

  const t = useTranslations("Links");
  return (
    <footer className={styles.footer}>
      <p>Created by Nati Gurevich</p>
      <Link
        className={`${styles.accessibility} ${isRTL ? styles.rtl : undefined}`}
        href='/terms'
      >
        {t("terms")}
      </Link>
      <p></p>
    </footer>
  );
}
