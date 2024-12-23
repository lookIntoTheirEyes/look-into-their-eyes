import { useTranslations } from "next-intl";
import { EMAIL } from "@/lib/model/common";

const AccessibilityStatement = () => {
  const t = useTranslations("accessibility");
  const features = [
    "feature_text_resize",
    "feature_text_spacing",
    "feature_line_height",
    "feature_invert_colors",
    "feature_gray_hues",
    "feature_underline_links",
    "feature_big_cursor",
    "feature_reading_guide",
    "feature_text_to_speech",
    "feature_speech_to_text",
    "feature_disable_animations",
  ];

  return (
    <>
      <h1 className='infoTitle'>{t("title")}</h1>
      <p className='infoParagraph'>
        <b>{t("company_name")}</b> {t("intro_paragraph_1")}
      </p>
      <p className='infoParagraph'>{t("intro_paragraph_2")}</p>
      <p className='infoParagraph'>
        {t("accessibility_initiative_1")}
        <a
          className='infoLink'
          href='https://www.w3.org/TR/WCAG21/'
          title={t("wcag_link_title")}
          rel='nofollow'
        >
          {t("wcag_link")}
        </a>{" "}
        {t("accessibility_initiative_2")}
      </p>
      <section className='infoSection'>
        <h2 className='infoSubTitle'>{t("accessibility_features_title")}</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature}>{t(feature)}</li>
          ))}
        </ul>
      </section>
      <section className='infoSection'>
        <h2 className='infoSubTitle'>{t("contact_us_title")}</h2>
        <p className='infoParagraph'>{t("contact_us_paragraph")}</p>

        <p className='infoSubTitle'>{t("contact_info_title")}</p>
        <ul>
          <li>{t("company_name")}</li>
          <li>
            {t("email_label")}
            <a className='infoLink' href={`mailto:${EMAIL}`} rel='nofollow'>
              {EMAIL}
            </a>
          </li>
        </ul>

        <p className='infoParagraph'>{t("accessibility_commitment")}</p>
      </section>
    </>
  );
};

export default AccessibilityStatement;
