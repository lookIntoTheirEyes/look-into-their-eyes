import PageContainer from "@/components/PageContainer/PageContainer";
import { Language } from "@/lib/model/language";

import { getTranslations } from "next-intl/server";

import styles from "./page.module.css";

export default async function Home(props: {
  params: Promise<{ locale: Language }>;
}) {
  const params = await props.params;
  const { locale: lang } = params;
  const t = await getTranslations("HomePage");

  return (
    <PageContainer center lang={lang} isCoolFont={lang === Language.he}>
      <h1 className={styles.header}>{t("title")}</h1>
    </PageContainer>
  );
}
