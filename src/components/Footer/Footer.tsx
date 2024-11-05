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
      <div className={`${styles.links} ${isRTL ? styles.rtl : ""}`}>
        <Link href='/terms'>{t("terms")}</Link>
        <Link href='/privacy'>{t("privacy")}</Link>
      </div>
    </footer>
  );
}
