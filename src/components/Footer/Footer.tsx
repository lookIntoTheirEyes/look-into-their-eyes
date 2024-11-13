import { useTranslations } from "next-intl";
import styles from "./Footer.module.css";
import NavLink from "../NavLink/NavLink";
import { getRoute } from "@/lib/utils/utils";
import { FaFacebook, FaLinkedin } from "react-icons/fa";
import SocialIcon from "../SocialIcon/SocialIcon";

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

  const icons = [
    { href: "https://www.facebook.com/nati.gurevich.3", icon: FaFacebook },
    {
      href: "https://www.linkedin.com/in/nati-gurevich-36868711b",
      icon: FaLinkedin,
    },
  ].map(({ href, icon: Icon }) => (
    <SocialIcon key={href} href={href} Icon={Icon} />
  ));

  return (
    <footer className={styles.footer}>
      <div className={styles.creator}>
        <p>{t("createdBy")}</p>
        {icons}
      </div>
      <div className={styles.links}>{links}</div>
    </footer>
  );
}
