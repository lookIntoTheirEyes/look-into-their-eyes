import { useTranslations } from "next-intl";

import { EMAIL } from "@/lib/model/common";

const PrivacyPolicy = () => {
  const t = useTranslations("privacy_policy");

  return (
    <>
      <h1 className='infoTitle'>{t("title")}</h1>

      <p className='infoParagraph'>{t("intro")}</p>

      <h2 className='infoSubTitle'>{t("section_1.title")}</h2>
      <p className='infoParagraph'>{t("section_1.content")}</p>

      <h2 className='infoSubTitle'>{t("section_2.title")}</h2>
      <p className='infoParagraph'>{t("section_2.content")}</p>

      <h2 className='infoSubTitle'>{t("section_3.title")}</h2>
      <p className='infoParagraph'>{t("section_3.content")}</p>

      <h2 className='infoSubTitle'>{t("section_4.title")}</h2>
      <p className='infoParagraph'>{t("section_4.content")}</p>

      <h2 className='infoSubTitle'>{t("section_5.title")}</h2>
      <p className='infoParagraph'>{t("section_5.content")}</p>

      <h2 className='infoSubTitle'>{t("section_6.title")}</h2>
      <p className='infoParagraph'>{t("section_6.content")}</p>

      <h2 className='infoSubTitle'>{t("section_7.title")}</h2>
      <p className='infoParagraph'>{t("section_7.content")}</p>

      <h2 className='infoSubTitle'>{t("section_8.title")}</h2>
      <p className='infoParagraph'>{t("section_8.content")}</p>

      <h2 className='infoSubTitle'>{t("section_9.title")}</h2>
      <p className='infoParagraph'>{t("section_9.content")}</p>

      <h2 className='infoSubTitle'>{t("section_10.title")}</h2>
      <p className='infoParagraph'>{t("section_10.content")}</p>

      <h2 className='infoSubTitle'>{t("section_11.title")}</h2>
      <p className='infoParagraph'>
        {t("section_11.content")}{" "}
        <a href={`mailto:${EMAIL}`} className='infoLink'>
          {EMAIL}.
        </a>
      </p>

      <h2 className='infoTitle'>{t("cookie_policy.title")}</h2>
      <p className='infoParagraph'>{t("cookie_policy.intro")}</p>

      <h3 className='infoSubTitle'>
        {t("cookie_policy.essential_cookies.title")}
      </h3>
      <p className='infoParagraph'>
        {t("cookie_policy.essential_cookies.content")}
      </p>

      <h3 className='infoSubTitle'>
        {t("cookie_policy.analytics_cookies.title")}
      </h3>
      <p className='infoParagraph'>
        {t("cookie_policy.analytics_cookies.content")}
      </p>

      <h3 className='infoSubTitle'>
        {t("cookie_policy.managing_cookies.title")}
      </h3>
      <p className='infoParagraph'>
        {t("cookie_policy.managing_cookies.content")}
      </p>

      <h3 className='infoSubTitle'>{t("cookie_policy.opt_out_ga.title")}</h3>
      <p className='infoParagraph'>{t("cookie_policy.opt_out_ga.content")}</p>

      <h3 className='infoSubTitle'>{t("cookie_policy.contact.title")}</h3>
      <p className='infoParagraph'>
        {t("cookie_policy.contact.content")}{" "}
        <a href={`mailto:${EMAIL}`} className='infoLink'>
          {EMAIL}.
        </a>
      </p>

      <p className='infoParagraph'>{t("cookie_policy.consent")}</p>
    </>
  );
};

export default PrivacyPolicy;
