import { useLocale, useTranslations } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";
import { locales } from "@/i18n/routing";
import styles from "./LocaleSwitcher.module.css";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  const getLocaleLabel = (localeCode: string) => {
    if (localeCode === "he") {
      return "🇮🇱 עברית";
    } else if (localeCode === "en") {
      return "🇺🇸 ENGLISH";
    }
    return "Unknown";
  };

  return (
    <LocaleSwitcherSelect defaultValue={locale} label={t("label")}>
      {locales.map((cur) => (
        <option className={styles.option} key={cur} value={cur}>
          {getLocaleLabel(cur)}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
}
