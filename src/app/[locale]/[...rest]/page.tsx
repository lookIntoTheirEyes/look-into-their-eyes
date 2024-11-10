import PageContainer from "@/components/PageContainer/PageContainer";

import styles from "./page.module.css";
import NavLink from "@/components/NavLink/NavLink";
import { useTranslations } from "next-intl";

export default function CatchAllPage() {
  const t = useTranslations("404");

  return (
    <PageContainer center>
      <>
        <h1 className={styles.header}>404 - {t("header")}</h1>
        <div className={styles.action}>
          <p>{t("link1")}</p>
          <NavLink isColor bold href={{ pathname: "/" }}>
            {t("cta")}
          </NavLink>
          <p>{t("link2")}</p>
        </div>
      </>
    </PageContainer>
  );
}
