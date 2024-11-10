import PageContainer from "@/components/PageContainer/PageContainer";
import { ILanguageProps, Language } from "@/lib/model/language";
import { getTranslations } from "next-intl/server";
import styles from "./page.module.css";
import NavLink from "@/components/NavLink/NavLink";

export default async function CatchAllPage(props: ILanguageProps) {
  const params = await props.params;
  const { locale: lang } = params;

  const t = await getTranslations("404");

  return (
    <PageContainer center lang={lang} isCoolFont={lang === Language.he}>
      <>
        <h1>404 - {t("header")}</h1>
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
