"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Link } from "@/i18n/routing";
import styles from "./Nav.module.css";

export default function Nav({
  routes,
}: {
  routes: { home: string; story: string; about: string };
}) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : "/";

  return (
    <nav className={styles.nav}>
      <ul className={styles.nav}>
        <Link
          href={{ pathname: "/" }}
          className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        >
          {routes.home}
        </Link>
        {/* <Link
          href={{ pathname: "/story" }}
          className={`${styles.link} ${
            pathname === "/story" ? styles.active : ""
          }`}
        > */}
        <Link
          href={{ pathname: "/story/[page]", params: { page: "1" } }}
          className={`${styles.link} ${
            pathname === "/story" ? styles.active : ""
          }`}
        >
          {routes.story}
        </Link>
        <Link
          href={{ pathname: "/about" }}
          className={`${styles.link} ${
            pathname === "/about" ? styles.active : ""
          }`}
        >
          {routes.about}
        </Link>
      </ul>
    </nav>
  );
}
