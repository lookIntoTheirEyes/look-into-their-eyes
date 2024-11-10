"use client";

import PageContainer from "@/components/PageContainer/PageContainer";
import styles from "./error.module.css";
import NavLink from "@/components/NavLink/NavLink";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

type Props = {
  error: Error;
};

export default function Error({ error }: Props) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer center>
      <>
        <h1>{t("header")}</h1>
        <p>{t("description")}</p>
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
