import styles from "./LegalContainer.module.css";

const LegalContainer: React.FC<{
  children: JSX.Element;
}> = ({ children }) => {
  return <>{<div className={styles.container}>{children}</div>}</>;
};

export default LegalContainer;
