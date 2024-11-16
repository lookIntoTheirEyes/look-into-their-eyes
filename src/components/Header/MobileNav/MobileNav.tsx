"use client";

import styles from "./MobileNav.module.css";

interface HeaderProps {
  links: JSX.Element[];
  menuOpen: boolean;
  handleToggleMenu: () => void;
}

export default function MobileNav({
  menuOpen,
  links,
  handleToggleMenu,
}: HeaderProps) {
  return (
    <nav className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>
      <button className={styles.hamburger} onClick={handleToggleMenu}>
        ☰
      </button>

      {menuOpen && (
        <aside>
          <ul className={styles.mobileNav}>{links}</ul>
        </aside>
      )}
    </nav>
  );
}
