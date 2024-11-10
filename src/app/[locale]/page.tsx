import PageContainer from "@/components/PageContainer/PageContainer";

import styles from "./page.module.css";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <PageContainer center>
      <h1 className={styles.header}>{t("title")}</h1>
    </PageContainer>
  );
}
