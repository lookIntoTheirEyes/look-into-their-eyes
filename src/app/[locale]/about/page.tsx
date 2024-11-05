import { useTranslations } from "next-intl";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import styles from "./page.module.css";
import { IconType } from "react-icons";

export default function About() {
  const t = useTranslations("About");

  const icons = [
    { href: "https://facebook.com", icon: FaFacebook },
    { href: "https://twitter.com", icon: FaTwitter },
    { href: "https://instagram.com", icon: FaInstagram },
    { href: "https://linkedin.com", icon: FaLinkedin },
  ].map(({ href, icon: Icon }) => {
    return getSocialLink(href, Icon);
  });
  return (
    <div className={styles.container}>
      <h1>{t("intro")}</h1>
      <p> {t("artist")}</p>
      <div className={styles.socialIcons}>{icons}</div>
    </div>
  );
}

function getSocialLink(href: string, Icon: IconType) {
  return (
    <a href={href} key={href} target='_blank' rel='noopener noreferrer'>
      <Icon size={24}></Icon>
    </a>
  );
}
