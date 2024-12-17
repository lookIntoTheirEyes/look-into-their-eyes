"use client";

import styles from "./DesktopNav.module.css";

interface HeaderProps {
  links: React.JSX.Element[];
  children?: React.ReactNode;
}

const DesktopNav: React.FC<HeaderProps> = ({ links, children }) => {
  return (
    <nav>
      <ul className={styles.nav}>
        {children}
        {links}
      </ul>
    </nav>
  );
};

export default DesktopNav;
