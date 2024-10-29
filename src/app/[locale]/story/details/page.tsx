import styles from "./page.module.css";
import ModalBackdrop from "@/components/ModalBackdrop/ModalBackdrop";

const HeroDetails = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const page = searchParams.page
    ? Array.isArray(searchParams.page)
      ? searchParams.page[0]
      : searchParams.page
    : "";

  return (
    <div aria-modal='true'>
      <ModalBackdrop />
      <dialog className={styles.modal} open>
        <div className='fullscreen-image'>
          <div>Details - {page}</div>
        </div>
      </dialog>
    </div>
  );
};

export default HeroDetails;
