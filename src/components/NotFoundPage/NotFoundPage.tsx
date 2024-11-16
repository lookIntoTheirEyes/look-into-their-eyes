import PageContainer from "@/components/PageContainer/PageContainer";
import styles from "./page.module.css";
import NavLink from "@/components/NavLink/NavLink";
import { useTranslations } from "next-intl";

export default function CatchAllPage() {
  const t = useTranslations("404");

  return (
    <PageContainer center>
      <>
        <h1 className={styles.header}>
          <span>101</span> <span> {t("header")}</span>
        </h1>
        <h2 className={styles.secondary}>{t("secondary-header")}</h2>
        <div className={styles.action}>
          <p>{t("link1")}</p>
          <NavLink isColor href={{ pathname: "/" }}>
            {t("cta")}
          </NavLink>
          <p>{t("link2")}</p>
        </div>
      </>
    </PageContainer>
  );
}
