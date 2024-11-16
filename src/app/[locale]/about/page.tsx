import { FaFacebook, FaInstagram } from "react-icons/fa";
import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import PageContainer from "@/components/PageContainer/PageContainer";
import SocialIcon from "@/components/SocialIcon/SocialIcon";
import Image from "@/components/Image/Image";
import { getImageUrl } from "@/lib/utils/heroesService";

export default function About() {
  const t = useTranslations("About");

  const icons = [
    {
      href: "https://www.facebook.com/people/%D7%91%D7%A0%D7%A6%D7%99-%D7%91%D7%A8%D7%95%D7%A4%D7%9E%D7%9F-%D7%90%D7%9E%D7%9F-%D7%92%D7%A8%D7%A4%D7%99%D7%98%D7%99/100063486852636",
      icon: FaFacebook,
    },
    { href: "https://www.instagram.com/benzi_brofman", icon: FaInstagram },
  ].map(({ href, icon: Icon }) => (
    <SocialIcon key={href} href={href} Icon={Icon} size={40} />
  ));
  return (
    <PageContainer center>
      <div className={styles.aboutContainer}>
        <div className={styles.nameContainer}>
          <h1 className={styles.header}>{t("intro")}</h1>
          <span>-</span>
          <h2> {t("artist")}</h2>
        </div>
        <div className={styles.imageContainer}>
          <Image
            imageUrl={getImageUrl(
              "v1731753364/Photo_by_Clemens_Hirmke_1_unwdvq.jpg"
            )}
            alt={t("artist")}
            borderRadius='1000px'
          />
        </div>
        <div className={styles.socialIcons}>{icons}</div>
      </div>
    </PageContainer>
  );
}
