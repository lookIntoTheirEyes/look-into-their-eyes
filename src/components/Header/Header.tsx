"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./Header.module.css";

import LanguageInput from "../LanguageInput/LanguageInput";
import NavLink from "../NavLink/NavLink";
import { Language } from "@/lib/model/language";
import { getRoute } from "@/lib/utils/utils";
import MobileNav from "./MobileNav/MobileNav";
import DesktopNav from "./DesktopNav/DesktopNav";

interface HeaderProps {
  links: { story: string; home: string; about: string };
  locale: Language;
}

export default function Header({
  links: { home, about, story },
  locale,
}: HeaderProps) {
  const { scrollY } = useScroll();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    getRoute({ pathname: "/" }, home),
    getRoute({ pathname: "/story", query: { page: 1 } }, story),
    getRoute({ pathname: "/about" }, about),
  ].map(({ href, name }) => (
    <li
      onClick={() => {
        if (isMobile) {
          handleToggleMenu();
        }
      }}
      key={name}
    >
      <NavLink href={href}>{name}</NavLink>
    </li>
  ));

  const backgroundColor = useTransform(
    scrollY,
    [0, 60],
    ["rgb(51, 51, 51)", "rgba(51, 51, 51, 0.8)"]
  );

  useEffect(() => {
    const checkMobile = () => {
      const isMobileValue = getComputedStyle(document.body).getPropertyValue(
        "--is-mobile"
      );
      setIsMobile(isMobileValue === "1");
    };

    checkMobile();
  }, []);

  const handleToggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  return (
    <motion.header
      style={{
        backgroundColor,
      }}
      className={styles.header}
    >
      {isMobile ? (
        <MobileNav
          menuOpen={menuOpen}
          handleToggleMenu={handleToggleMenu}
          links={links}
        />
      ) : (
        <DesktopNav links={links} />
      )}

      <LanguageInput locale={locale} />
    </motion.header>
  );
}
