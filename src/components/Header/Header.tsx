"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./header.module.css";

import LanguageInput from "../LanguageInput/LanguageInput";
import NavLink from "../NavLink/NavLink";
import { Language } from "@/lib/model/language";
import { getRoute } from "@/lib/utils/utils";

interface HeaderProps {
  links: { story: string; home: string; about: string };
  locale: Language;
}

export default function Header({
  links: { home, about, story },
  locale,
}: HeaderProps) {
  const { scrollY } = useScroll();

  const links = [
    getRoute({ pathname: "/" }, home),
    getRoute({ pathname: "/story", query: { page: 1 } }, story),
    getRoute({ pathname: "/about" }, about),
  ].map(({ href, name }) => (
    <li key={name}>
      <NavLink href={href}>{name}</NavLink>
    </li>
  ));

  const backgroundColor = useTransform(
    scrollY,
    [0, 60],
    ["rgb(51, 51, 51)", "rgba(51, 51, 51, 0.8)"]
  );

  return (
    <motion.header
      style={{
        backgroundColor,
      }}
      className={styles.header}
    >
      <nav>
        <ul className={styles.nav}>{links}</ul>
      </nav>
      <LanguageInput locale={locale} />
    </motion.header>
  );
}
