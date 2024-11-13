"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { Link, Pathnames } from "@/i18n/routing";
import styles from "./NavLink.module.css";

interface NavLinkProps {
  href: { pathname: Pathnames; query?: Record<string, string | number> };
  children: React.ReactNode;

  isColor?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  isColor = false,
}) => {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : "/";
  const isActive = pathname === href.pathname;

  return (
    <Link
      className={`${styles.link} ${isColor || isActive ? styles.active : ""}`}
      href={href}
    >
      {children}
    </Link>
  );
};

export default NavLink;
