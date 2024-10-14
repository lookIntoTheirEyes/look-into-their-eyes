import { useTranslations } from "next-intl";
import styles from "./page.module.css";

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{t("title")}</h1>
      <h2 className={styles.chapter}>Chapter 1: The Beginning</h2>
      <p>
        This is where the story begins. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </p>
      {/* Additional chapters and content */}
    </main>
  );
}
