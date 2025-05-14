import { useTranslations } from "next-intl";
import NavLink from "@/components/NavLink/NavLink";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  const t = useTranslations("404");

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>
        <strong className={styles.number}>58</strong>{" "}
        <span> {t("header")}</span>
      </h1>
      <h2 className={styles.secondary}>{t("secondary-header")}</h2>
      <div className={styles.action}>
        <p>{t("link1")}</p>
        <NavLink className={styles.link} href={{ pathname: "/" }}>
          {t("cta")}
        </NavLink>
        <p>{t("link2")}</p>
      </div>
    </div>
  );
}
