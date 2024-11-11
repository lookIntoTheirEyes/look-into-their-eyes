import styles from "./PageContainer.module.css";

const PageContainer: React.FC<{
  children: JSX.Element;
  center?: boolean;
  isStory?: boolean;
  isLegal?: boolean;
}> = ({ children, isLegal = false, center = false, isStory = false }) => {
  const view = isStory ? (
    children
  ) : (
    <div className={`${styles.container} ${center ? styles.center : ""} `}>
      {children}
    </div>
  );

  return (
    <main
      className={`${styles.main} ${isStory ? styles.story : ""} ${
        isLegal ? styles.legal : ""
      }`}
    >
      {view}
    </main>
  );
};

export default PageContainer;
