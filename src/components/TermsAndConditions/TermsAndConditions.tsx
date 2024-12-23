import { useTranslations } from "next-intl";

import Link from "next/link";
import { EMAIL } from "@/lib/model/common";

const TermsAndConditions = () => {
  const t = useTranslations("terms");

  return (
    <>
      <h1 className='infoTitle'>{t("title")}</h1>
      <p className='infoParagraph'>{t("last_updated")}</p>
      <p className='infoParagraph'>{t("intro")}</p>

      <h2 className='infoSubTitle'>
        {t("sections.interpretation_and_definitions.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.interpretation_and_definitions.definition_intro")}
      </p>

      <p className='infoParagraph'>
        <strong>
          {t("sections.interpretation_and_definitions.affiliate")}
        </strong>
      </p>
      <p className='infoParagraph'>
        <strong>{t("sections.interpretation_and_definitions.country")}</strong>
      </p>
      <p className='infoParagraph'>
        <strong>{t("sections.interpretation_and_definitions.company")}</strong>
      </p>
      <p className='infoParagraph'>
        <strong>{t("sections.interpretation_and_definitions.device")}</strong>
      </p>
      <p className='infoParagraph'>
        <strong>{t("sections.interpretation_and_definitions.service")}</strong>
      </p>
      <p className='infoParagraph'>
        <strong>
          {t("sections.interpretation_and_definitions.terms_and_conditions")}
        </strong>
      </p>
      <p className='infoParagraph'>
        <strong>
          {t(
            "sections.interpretation_and_definitions.third_party_social_media_service"
          )}
        </strong>
      </p>
      <p className='infoParagraph'>
        <strong>{t("sections.interpretation_and_definitions.website")}</strong>
      </p>
      <p className='infoParagraph'>
        <strong>{t("sections.interpretation_and_definitions.you")}</strong>
      </p>

      <h2 className='infoSubTitle'>{t("sections.acknowledgment.title")}</h2>
      <p className='infoParagraph'>{t("sections.acknowledgment.content")}</p>

      <h2 className='infoSubTitle'>
        {t("sections.links_to_other_websites.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.links_to_other_websites.content")}
      </p>

      <h2 className='infoSubTitle'>
        {t("sections.third_party_policies.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.third_party_policies.content")}
      </p>

      <h2 className='infoSubTitle'>
        {t("sections.intellectual_property.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.intellectual_property.content")}
      </p>

      <h2 className='infoSubTitle'>{t("sections.disclaimer.title")}</h2>
      <p className='infoParagraph'>{t("sections.disclaimer.content")}</p>

      <h2 className='infoSubTitle'>
        {t("sections.limitation_of_liability.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.limitation_of_liability.content")}
      </p>

      <h2 className='infoSubTitle'>{t("sections.governing_law.title")}</h2>
      <p className='infoParagraph'>{t("sections.governing_law.content")}</p>

      <h2 className='infoSubTitle'>{t("sections.dispute_resolution.title")}</h2>
      <p className='infoParagraph'>
        {t("sections.dispute_resolution.content")}
      </p>

      <h2 className='infoSubTitle'>{t("sections.eu_users.title")}</h2>
      <p className='infoParagraph'>{t("sections.eu_users.content")}</p>

      <h2 className='infoSubTitle'>
        {t("sections.us_legal_compliance.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.us_legal_compliance.content")}
      </p>

      <h2 className='infoSubTitle'>
        {t("sections.severability_and_waiver.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.severability_and_waiver.content")}
      </p>

      <h2 className='infoSubTitle'>
        {t("sections.translation_interpretation.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.translation_interpretation.content")}
      </p>

      <h2 className='infoSubTitle'>{t("sections.changes_to_terms.title")}</h2>
      <p className='infoParagraph'>{t("sections.changes_to_terms.content")}</p>

      <h2 className='infoSubTitle'>{t("sections.contact_us.title")}</h2>
      <p className='infoParagraph'>
        {t("sections.contact_us.content")}
        <a href={`mailto:${EMAIL}`} className='infoLink'>
          {EMAIL}.
        </a>
      </p>

      <h2 className='infoSubTitle'>
        {t("sections.content_guidelines_and_sensitivity_notice.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.content_guidelines_and_sensitivity_notice.content")}
      </p>

      <h2 className='infoSubTitle'>{t("sections.user_conduct.title")}</h2>
      <p className='infoParagraph'>{t("sections.user_conduct.content")}</p>

      <h2 className='infoSubTitle'>
        {t("sections.privacy_and_data_collection.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.privacy_and_data_collection.content")}
      </p>

      <h2 className='infoSubTitle'>{t("sections.prohibited_uses.title")}</h2>
      <p className='infoParagraph'>{t("sections.prohibited_uses.content")}</p>

      <h2 className='infoSubTitle'>
        {t("sections.content_rights_and_attribution.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.content_rights_and_attribution.content")}
      </p>

      <h2 className='infoSubTitle'>
        {t("sections.accessibility_notice.title")}
      </h2>
      <p className='infoParagraph'>
        {t("sections.accessibility_notice.content")}
      </p>
      <p className='infoParagraph'>
        {t("sections.accessibility_notice.link")}
        <Link href='/accessibility' className='infoLink'>
          {t("sections.accessibility_notice.notice")}
        </Link>
      </p>
    </>
  );
};

export default TermsAndConditions;
