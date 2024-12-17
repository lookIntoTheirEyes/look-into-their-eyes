import styles from "./LegalContainer.module.css";

const LegalContainer: React.FC<{
  children: React.JSX.Element;
}> = ({ children }) => {
  return <>{<div className={styles.container}>{children}</div>}</>;
};

export default LegalContainer;
