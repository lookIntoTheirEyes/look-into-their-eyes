import { useTranslations } from "next-intl";
import Image from "@/components/Image/Image";
import { getImageUrl } from "@/lib/utils/utils";
import styles from "./page.module.css";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t("title")}</h1>
      <div className={styles.imageContainer}>
        <Image
          imageUrl={getImageUrl(
            "v1731932344/%D7%91%D7%A0%D7%A6%D7%99_%D7%91%D7%A9%D7%9C%D7%98_dkf1ei.jpg"
          )}
          alt={"image"}
          height={400}
        />
      </div>
    </div>
  );
}
