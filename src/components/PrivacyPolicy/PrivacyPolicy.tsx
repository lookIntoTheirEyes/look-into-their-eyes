import React from "react";
import { useTranslations } from "next-intl";
import styles from "./PrivacyPolicy.module.css";
import { Language } from "@/lib/model/language";

const PrivacyPolicy: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = useTranslations("privacy_policy");
  const email = "look.into.their.eyes.0710@gmail.com";

  return (
    <div
      className={`${styles.container} ${
        lang === Language.he ? styles.rtl : ""
      }`}
    >
      <h1 className={styles.title}>{t("title")}</h1>

      <p className={styles.paragraph}>{t("intro")}</p>

      <h2 className={styles.subTitle}>{t("section_1.title")}</h2>
      <p className={styles.paragraph}>{t("section_1.content")}</p>

      <h2 className={styles.subTitle}>{t("section_2.title")}</h2>
      <p className={styles.paragraph}>{t("section_2.content")}</p>

      <h2 className={styles.subTitle}>{t("section_3.title")}</h2>
      <p className={styles.paragraph}>{t("section_3.content")}</p>

      <h2 className={styles.subTitle}>{t("section_4.title")}</h2>
      <p className={styles.paragraph}>{t("section_4.content")}</p>

      <h2 className={styles.subTitle}>{t("section_5.title")}</h2>
      <p className={styles.paragraph}>{t("section_5.content")}</p>

      <h2 className={styles.subTitle}>{t("section_6.title")}</h2>
      <p className={styles.paragraph}>{t("section_6.content")}</p>

      <h2 className={styles.subTitle}>{t("section_7.title")}</h2>
      <p className={styles.paragraph}>{t("section_7.content")}</p>

      <h2 className={styles.subTitle}>{t("section_8.title")}</h2>
      <p className={styles.paragraph}>{t("section_8.content")}</p>

      <h2 className={styles.subTitle}>{t("section_9.title")}</h2>
      <p className={styles.paragraph}>{t("section_9.content")}</p>

      <h2 className={styles.subTitle}>{t("section_10.title")}</h2>
      <p className={styles.paragraph}>{t("section_10.content")}</p>

      <h2 className={styles.subTitle}>{t("section_11.title")}</h2>
      <p className={styles.paragraph}>
        {t("section_11.content")}{" "}
        <a href={`mailto:${email}`} className={styles.email}>
          {email + "."}
        </a>
      </p>

      <h2 className={styles.title}>{t("cookie_policy.title")}</h2>
      <p className={styles.paragraph}>{t("cookie_policy.intro")}</p>

      <h3 className={styles.subTitle}>
        {t("cookie_policy.essential_cookies.title")}
      </h3>
      <p>{t("cookie_policy.essential_cookies.content")}</p>

      <h3 className={styles.subTitle}>
        {t("cookie_policy.analytics_cookies.title")}
      </h3>
      <p>{t("cookie_policy.analytics_cookies.content")}</p>

      <h3 className={styles.subTitle}>
        {t("cookie_policy.managing_cookies.title")}
      </h3>
      <p>{t("cookie_policy.managing_cookies.content")}</p>

      <h3 className={styles.subTitle}>{t("cookie_policy.opt_out_ga.title")}</h3>
      <p>{t("cookie_policy.opt_out_ga.content")}</p>

      <h3 className={styles.subTitle}>{t("cookie_policy.contact.title")}</h3>
      <p>
        {t("cookie_policy.contact.content")}{" "}
        <a href={`mailto:${email}`} className={styles.email}>
          {email + "."}
        </a>
      </p>

      <p>{t("cookie_policy.consent")}</p>
    </div>
  );
};

export default PrivacyPolicy;
