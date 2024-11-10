import { Language } from "@/lib/model/language";
import styles from "./PageContainer.module.css";

const PageContainer: React.FC<{
  lang?: Language;
  children: JSX.Element;
  center?: boolean;
  isStory?: boolean;
}> = ({ lang = Language.he, children, center = false, isStory = false }) => {
  const view = isStory ? (
    children
  ) : (
    <div
      className={`${styles.container} ${center ? styles.center : ""} ${
        lang === Language.he ? styles.rtl : ""
      }`}
    >
      {children}
    </div>
  );

  return (
    <main className={`${styles.main} ${isStory ? styles.story : ""}`}>
      {view}
    </main>
  );
};

export default PageContainer;
