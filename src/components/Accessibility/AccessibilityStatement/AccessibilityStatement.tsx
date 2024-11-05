import React from "react";
import { useTranslations } from "next-intl";
import styles from "./AccessibilityStatement.module.css";
import { Language } from "@/lib/model/language";

const AccessibilityStatement: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = useTranslations("accessibility");

  return (
    <div
      className={`${styles.container} ${
        lang === Language.he ? styles.rtl : ""
      }`}
    >
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.paragraph}>
        <b>{t("company_name")}</b> {t("intro_paragraph_1")}
      </p>
      <p className={styles.paragraph}>{t("intro_paragraph_2")}</p>
      <p className={styles.paragraph}>
        {t("accessibility_initiative_1")}
        <a
          className={styles.link}
          href='https://www.w3.org/TR/WCAG21/'
          title={t("wcag_link_title")}
          rel='nofollow'
        >
          {t("wcag_link")}
        </a>{" "}
        {t("accessibility_initiative_2")}
      </p>

      <h2 className={styles.subTitle}>{t("contact_us_title")}</h2>
      <p className={styles.paragraph}>{t("contact_us_paragraph")}</p>

      <p className={styles.contactHeader}>{t("contact_info_title")}</p>
      <ul className={styles.list}>
        <li>{t("company_name")}</li>
        <li>
          {t("email_label")}{" "}
          <a
            className={styles.link}
            href='mailto:look.into.their.eyes.0710@gmail.com'
            rel='nofollow'
          >
            look.into.their.eyes.0710@gmail.com
          </a>
        </li>
      </ul>

      <p className={styles.paragraph}>{t("accessibility_commitment")}</p>
    </div>
  );
};

export default AccessibilityStatement;
