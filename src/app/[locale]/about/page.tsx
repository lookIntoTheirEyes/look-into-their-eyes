import { FaFacebook, FaInstagram } from "react-icons/fa";
import styles from "./page.module.css";
import { IconType } from "react-icons";
import PageContainer from "@/components/PageContainer/PageContainer";
import { useTranslations } from "next-intl";

export default function About() {
  const t = useTranslations("About");

  const icons = [
    { href: "https://facebook.com", icon: FaFacebook },
    { href: "https://instagram.com", icon: FaInstagram },
  ].map(({ href, icon: Icon }) => {
    return getSocialLink(href, Icon);
  });
  return (
    <PageContainer center>
      <>
        <h1 className={styles.header}>{t("intro")}</h1>
        <p> {t("artist")}</p>
        <div className={styles.socialIcons}>{icons}</div>
      </>
    </PageContainer>
  );
}

function getSocialLink(href: string, Icon: IconType) {
  return (
    <a href={href} key={href} target='_blank' rel='noopener noreferrer'>
      <Icon size={24}></Icon>
    </a>
  );
}
