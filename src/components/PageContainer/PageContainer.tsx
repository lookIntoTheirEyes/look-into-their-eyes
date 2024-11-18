import styles from "./PageContainer.module.css";

const PageContainer: React.FC<{
  children: JSX.Element;
  center?: boolean;
  isLegal?: boolean;
  pad?: boolean;
}> = ({ children, isLegal = false, center = false, pad = false }) => {
  const view = !isLegal ? (
    children
  ) : (
    <div className={`${styles.container} ${center ? styles.center : ""} `}>
      {children}
    </div>
  );

  const classNameMain = `${styles.main} ${isLegal ? styles.legal : ""} ${
    pad ? styles.padding : ""
  }`;

  return <main className={classNameMain}>{view}</main>;
};

export default PageContainer;
