"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { ComponentProps } from "react";
import { Link, Pathnames } from "@/i18n/routing";
import styles from "./NavLink.module.css";

export default function NavLink<Pathname extends Pathnames>({
  href,
  ...rest
}: ComponentProps<typeof Link<Pathname>>) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : "/";
  const isActive = pathname === href;

  return (
    <Link
      className={`${styles.link} ${isActive ? styles.active : ""}`}
      href={href}
      {...rest}
    />
  );
}
