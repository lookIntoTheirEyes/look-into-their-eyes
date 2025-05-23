import ModalClient from "@/components/Modal/Modal";
import { redirect } from "@/i18n/routing";
import { IStoryModalProps } from "@/lib/model/book";
import { getHero } from "@/lib/utils/heroesService";
import Image from "@/components/Image/Image";
import TextAnimationContainer from "@/components/TextAnimationContainer/TextAnimationContainer";
import styles from "./Modal.module.css";

const StoryModal: React.FC<IStoryModalProps> = async ({
  closeText,
  lang,
  pageNum,
}) => {
  try {
    const {
      name: title,
      longDescription,
      imageUrls,
    } = await getHero(pageNum, lang);

    return (
      <ModalClient
        closeText={closeText}
        lang={lang}
        paths={{ curr: "/story/details", next: "/story" }}
      >
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.pageImages}>
          {imageUrls.map((imageUrl, i) => (
            <div key={imageUrl + i} className={styles.imageBackground}>
              <div className={styles.pageImage}>
                <Image height={185} imageUrl={imageUrl} alt={title} priority />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.text}>
          <TextAnimationContainer text={longDescription || ""} />
        </div>
      </ModalClient>
    );
  } catch {
    redirect({ href: "/story", locale: lang });
  }
};

StoryModal.displayName = "StoryModal";
export default StoryModal;
