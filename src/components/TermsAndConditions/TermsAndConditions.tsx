import { useTranslations } from "next-intl";
import classes from "./TermsAndConditions.module.css";
import { Language } from "@/lib/model/language";

const TermsAndConditions: React.FC<{
  lang: Language;
}> = ({ lang }) => {
  const t = useTranslations("terms");
  const email = "look.into.their.eyes.0710@gmail.com";

  return (
    <div
      className={`${classes.container} ${
        lang === Language.he ? `${classes.rtl}` : undefined
      }`}
    >
      <h1>{t("title")}</h1>
      <p>{t("last_updated")}</p>
      <p>{t("intro")}</p>

      <h2>{t("sections.interpretation_and_definitions.title")}</h2>
      <p>{t("sections.interpretation_and_definitions.definition_intro")}</p>

      <p>
        <strong>
          {t("sections.interpretation_and_definitions.affiliate")}
        </strong>
      </p>
      <p>
        <strong>{t("sections.interpretation_and_definitions.country")}</strong>
      </p>
      <p>
        <strong>{t("sections.interpretation_and_definitions.company")}</strong>
      </p>
      <p>
        <strong>{t("sections.interpretation_and_definitions.device")}</strong>
      </p>
      <p>
        <strong>{t("sections.interpretation_and_definitions.service")}</strong>
      </p>
      <p>
        <strong>
          {t("sections.interpretation_and_definitions.terms_and_conditions")}
        </strong>
      </p>
      <p>
        <strong>
          {t(
            "sections.interpretation_and_definitions.third_party_social_media_service"
          )}
        </strong>
      </p>
      <p>
        <strong>{t("sections.interpretation_and_definitions.website")}</strong>
      </p>
      <p>
        <strong>{t("sections.interpretation_and_definitions.you")}</strong>
      </p>

      <h2>{t("sections.acknowledgment.title")}</h2>
      <p>{t("sections.acknowledgment.content")}</p>

      <h2>{t("sections.links_to_other_websites.title")}</h2>
      <p>{t("sections.links_to_other_websites.content")}</p>

      <h2>{t("sections.third_party_policies.title")}</h2>
      <p>{t("sections.third_party_policies.content")}</p>

      <h2>{t("sections.intellectual_property.title")}</h2>
      <p>{t("sections.intellectual_property.content")}</p>

      <h2>{t("sections.disclaimer.title")}</h2>
      <p>{t("sections.disclaimer.content")}</p>

      <h2>{t("sections.limitation_of_liability.title")}</h2>
      <p>{t("sections.limitation_of_liability.content")}</p>

      <h2>{t("sections.governing_law.title")}</h2>
      <p>{t("sections.governing_law.content")}</p>

      <h2>{t("sections.dispute_resolution.title")}</h2>
      <p>{t("sections.dispute_resolution.content")}</p>

      <h2>{t("sections.eu_users.title")}</h2>
      <p>{t("sections.eu_users.content")}</p>

      <h2>{t("sections.us_legal_compliance.title")}</h2>
      <p>{t("sections.us_legal_compliance.content")}</p>

      <h2>{t("sections.severability_and_waiver.title")}</h2>
      <p>{t("sections.severability_and_waiver.content")}</p>

      <h2>{t("sections.translation_interpretation.title")}</h2>
      <p>{t("sections.translation_interpretation.content")}</p>

      <h2>{t("sections.changes_to_terms.title")}</h2>
      <p>{t("sections.changes_to_terms.content")}</p>

      <h2>{t("sections.contact_us.title")}</h2>
      <p>
        {t("sections.contact_us.content")}
        <a href={`mailto:${email}`} className={classes.email}>
          {email}
        </a>
      </p>
    </div>
  );
};

export default TermsAndConditions;
