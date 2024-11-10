import styles from "./PageContainer.module.css";

const PageContainer: React.FC<{
  children: JSX.Element;
  center?: boolean;
  isStory?: boolean;
}> = ({ children, center = false, isStory = false }) => {
  const view = isStory ? (
    children
  ) : (
    <div className={`${styles.container} ${center ? styles.center : ""} `}>
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
