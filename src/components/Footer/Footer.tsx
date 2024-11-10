import { useTranslations } from "next-intl";
import styles from "./Footer.module.css";
import NavLink from "../NavLink/NavLink";
import { getRoute } from "@/lib/utils/utils";
import { IconType } from "react-icons";
import { FaFacebook, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const t = useTranslations("Links");

  const links = [
    getRoute({ pathname: "/terms" }, t("terms")),
    getRoute({ pathname: "/privacy" }, t("privacy")),
  ].map(({ href, name }) => (
    <NavLink key={name} href={href}>
      {name}
    </NavLink>
  ));
  const linkedin = getSocialLink(
    "https://www.linkedin.com/in/nati-gurevich-36868711b",
    FaLinkedin
  );
  const fb = getSocialLink(
    "https://www.facebook.com/nati.gurevich.3",
    FaFacebook
  );
  return (
    <footer className={styles.footer}>
      <div className={styles.creator}>
        <p>{t("createdBy")}</p>
        {linkedin}
        {fb}
      </div>
      <div className={styles.links}>{links}</div>
    </footer>
  );
}

function getSocialLink(href: string, Icon: IconType) {
  return (
    <a href={href} key={href} target='_blank' rel='noopener noreferrer'>
      <Icon size={24}></Icon>
    </a>
  );
}
