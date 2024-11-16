"use client";

import styles from "./DesktopNav.module.css";

interface HeaderProps {
  links: JSX.Element[];
}

export default function DesktopNav({ links }: HeaderProps) {
  return (
    <nav>
      <ul className={styles.nav}>{links}</ul>
    </nav>
  );
}
