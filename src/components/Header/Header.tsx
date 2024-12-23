"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "@/i18n/routing";
import NavLink from "../NavLink/NavLink";
import MobileNav from "./MobileNav/MobileNav";
import DesktopNav from "./DesktopNav/DesktopNav";
import LocaleSwitcher from "../LocaleSwitcher/LocaleSwitcher";
import logoImg from "/public/images/logo.png";
import { getRoute } from "@/lib/utils/utils";

import styles from "./Header.module.css";

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
  const path = usePathname();

  const links = [
    getRoute({ pathname: "/" }, home),
    getRoute({ pathname: "/story", query: { page: 1 } }, story),
    getRoute({ pathname: "/families" }, families),
    getRoute({ pathname: "/visitors" }, visitors),
    getRoute({ pathname: "/about" }, about),
  ].map(({ href, name }) => (
    <li
      key={name}
      onClick={(ev) => {
        if (isMobile) {
          ev.stopPropagation();
          setMenuOpen(false);
        }
      }}
    >
      <NavLink href={href}>{name}</NavLink>
    </li>
  ));

  const isNotHomePage = path !== "/";

  const Logo = isNotHomePage && (
    <div
      onClick={() => router.push("/", { scroll: false })}
      className={styles.logoContainer}
    >
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

  return (
    <motion.header
      style={{ opacity }}
      className={`${styles.header} ${isMobile ? styles.mobile : ""}`}
    >
      {isMobile ? (
        <MobileNav
          menuOpen={menuOpen}
          handleToggleMenu={() => setMenuOpen(!menuOpen)}
          links={links}
        />
      ) : (
        <DesktopNav links={links.slice(1)}>{Logo}</DesktopNav>
      )}
      {isNotHomePage && isMobile && Logo}
      <LocaleSwitcher />
    </motion.header>
  );
}
