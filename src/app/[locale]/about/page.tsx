import { FaFacebook, FaInstagram } from "react-icons/fa";
import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import PageContainer from "@/components/PageContainer/PageContainer";
import SocialIcon from "@/components/SocialIcon/SocialIcon";
import Image from "@/components/Image/Image";
export default function About() {
  const t = useTranslations("About");

  const icons = [
    { href: "https://facebook.com", icon: FaFacebook },
    { href: "https://instagram.com", icon: FaInstagram },
  ].map(({ href, icon: Icon }) => (
    <SocialIcon key={href} href={href} Icon={Icon} />
  ));
  return (
    <PageContainer center>
      <div className={styles.aboutContainer}>
        <h1 className={styles.header}>{t("intro")}</h1>
        <p> {t("artist")}</p>
        <div className={styles.imageContainer}>
          <Image
            imageUrl='https://res.cloudinary.com/dycup1zmv/image/upload/v1731312284/kijbzwguwzq2ukypz1ug.jpg'
            alt={t("artist")}
            borderRadius='1000px'
          />
        </div>
        <div className={styles.socialIcons}>{icons}</div>
      </div>
    </PageContainer>
  );
}
