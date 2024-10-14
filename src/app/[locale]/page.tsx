import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container + " .container"}>
      <main>
        <h1 className={styles.title}>Welcome to My Book</h1>
        <h2 className={styles.chapter}>Chapter 1: The Beginning</h2>
        <p>
          This is where the story begins. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
          labore et dolore magna aliqua.
        </p>
        {/* Additional chapters and content */}
      </main>
    </div>
  );
}
