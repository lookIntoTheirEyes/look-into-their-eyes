import { useTranslations } from "next-intl";
import styles from "./page.module.css";

export default function Home() {
  const t = useTranslations("HomePage");
  return <p>this is my main page</p>;
}
