import { useTranslations } from "next-intl";
import styles from "./Footer.module.css";
import { Language } from "@/lib/model/language";

export default function Footer({ locale }: { locale: Language }) {
  const isRTL = locale === Language.he;
  console.log("isRTL", locale, isRTL);

  const t = useTranslations("Links");
  return (
    <footer className={styles.footer}>
      <p>Created by Nati Gurevich</p>
      <p
        className={`${styles.accessibility} ${isRTL ? styles.rtl : undefined}`}
      >
        {t("accessibility")}
      </p>
    </footer>
  );
}
