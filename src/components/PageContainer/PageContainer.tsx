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

  const classNameMain = `${styles.main} ${isLegal ? styles.legal : ""}`;

  return <main className={classNameMain}>{view}</main>;
};

export default PageContainer;
