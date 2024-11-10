import { useTranslations } from "next-intl";
import styles from "./TermsAndConditions.module.css";
import Link from "next/link";

const TermsAndConditions = () => {
  const t = useTranslations("terms");
  const email = "look.into.their.eyes.0710@gmail.com";

  return (
    <>
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
        <a href={`mailto:${email}`} className={styles.email}>
          {email}
        </a>
      </p>

      <h2>{t("sections.content_guidelines_and_sensitivity_notice.title")}</h2>
      <p>{t("sections.content_guidelines_and_sensitivity_notice.content")}</p>

      <h2>{t("sections.user_conduct.title")}</h2>
      <p>{t("sections.user_conduct.content")}</p>

      <h2>{t("sections.privacy_and_data_collection.title")}</h2>
      <p>{t("sections.privacy_and_data_collection.content")}</p>

      <h2>{t("sections.prohibited_uses.title")}</h2>
      <p>{t("sections.prohibited_uses.content")}</p>

      <h2>{t("sections.content_rights_and_attribution.title")}</h2>
      <p>{t("sections.content_rights_and_attribution.content")}</p>

      <h2>{t("sections.accessibility_notice.title")}</h2>
      <p>{t("sections.accessibility_notice.content")}</p>
      <p>
        {t("sections.accessibility_notice.link")}
        <Link href='/accessibility' className={styles.email}>
          {t("sections.accessibility_notice.notice")}
        </Link>
      </p>
    </>
  );
};

export default TermsAndConditions;
