import { useTranslations } from "next-intl";
import styles from "./page.module.css";

export default function About() {
  const t = useTranslations("About");
  return (
    <div className={styles.container}>
      <h1>{t("intro")}</h1>
      <p> {t("artist")}</p>
    </div>
  );
}
