"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Link, Pathnames } from "@/i18n/routing";
import styles from "./NavLink.module.css";

interface NavLinkProps {
  href: { pathname: Pathnames; query?: Record<string, string | number> };
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  className = "",
}) => {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : "/";
  const isActive = pathname === href.pathname;

  return (
    <Link
      className={`${styles.link} ${isActive ? styles.active : ""} ${className}`}
      href={href}
    >
      {children}
    </Link>
  );
};

export default NavLink;
