"use client";

import styles from "./MobileNav.module.css";

interface HeaderProps {
  links: React.JSX.Element[];
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
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {
        <aside onClick={handleToggleMenu} className={styles.menuContainer}>
          <div className={styles.openNav}>
            <ul className={styles.mobileNav}>{links}</ul>
          </div>
        </aside>
      }
    </nav>
  );
}
