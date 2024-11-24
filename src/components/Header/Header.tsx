"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { startTransition, useState } from "react";
import styles from "./Header.module.css";
import NavLink from "../NavLink/NavLink";
import { getRoute } from "@/lib/utils/utils";
import MobileNav from "./MobileNav/MobileNav";
import DesktopNav from "./DesktopNav/DesktopNav";
import Image from "next/image";
import logoImg from "/public/images/logo.png";
import { useRouter } from "@/i18n/routing";
import LocaleSwitcher from "../LanguageInput/LocaleSwitcher";

interface HeaderProps {
  links: {
    story: string;
    home: string;
    about: string;
    visitors: string;
    families: string;
  };
  logoText: string;

  isMobile: boolean;
}

export default function Header({
  links: { home, about, story, families, visitors },
  logoText,
  isMobile,
}: HeaderProps) {
  const { scrollY } = useScroll();

  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const links = [
    getRoute({ pathname: "/" }, home),
    getRoute({ pathname: "/story", query: { page: 1 } }, story),
    getRoute({ pathname: "/families" }, families),
    getRoute({ pathname: "/visitors" }, visitors),
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

  const onLogoClick = () => {
    startTransition(() => {
      router.push("/", { scroll: false });
    });
  };

  const Logo = (
    <div onClick={onLogoClick} className={styles.logoContainer}>
      <Image
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        src={logoImg}
        fill
        priority
        alt={logoText}
      />
    </div>
  );

  const opacity = useTransform(scrollY, [0, 60], [1, 0.8]);

  const handleToggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  return (
    <motion.header
      style={{
        opacity,
      }}
      className={`${styles.header} ${isMobile ? styles.mobile : ""}`}
    >
      {isMobile ? (
        <MobileNav
          menuOpen={menuOpen}
          handleToggleMenu={handleToggleMenu}
          links={links}
        />
      ) : (
        <DesktopNav links={links.slice(1)}>{Logo}</DesktopNav>
      )}
      {isMobile && Logo}
      <LocaleSwitcher />
    </motion.header>
  );
}
