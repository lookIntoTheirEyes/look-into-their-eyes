"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Modal.module.css";

import Image from "../Image/Image";
import { getUpdatedPath } from "@/lib/utils/utils";
import { Language } from "@/lib/model/language";
import StyledButton from "../StyledButton/StyledButton";

interface IProps {
  page?: number;
  title: string;
  imageUrls: string[];
  hero?: string;
  description?: string;
  lang: Language;
  closeText: string;
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.2,
    rotate: 180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.2,
    rotate: 180,
    transition: {
      duration: 0.5,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const ModalClient = ({
  title,
  description,
  imageUrls,
  lang,
  closeText,
}: IProps) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const path = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get("page");

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 500);
  };

  useEffect(() => {
    if (path.includes("details")) {
      setIsVisible(true);
    }
  }, [path]);

  const handleExitComplete = () => {
    if (!isClosing) return;

    const path = getUpdatedPath(`/${lang}/story`, lang, page!);

    router.push(path, {
      scroll: false,
    });
  };

  return (
    <AnimatePresence mode='wait' onExitComplete={handleExitComplete}>
      {isVisible && (
        <motion.div
          key='backdrop'
          variants={backdropVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
          transition={{ duration: 0.5 }}
          onClick={handleClose}
          className={styles.backdrop}
        >
          <motion.div
            key='modal'
            variants={modalVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            transition={{ duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className={styles.modal}
          >
            <button
              onClick={handleClose}
              className={styles.closeButton}
              aria-label='Close Modal'
            >
              X
            </button>

            <div className={styles.modalContent}>
              <h2 className={styles.title}>{title}</h2>
              <div className={styles.pageImages}>
                {imageUrls.map((imageUrl, i) => (
                  <div key={imageUrl + i} className={styles.imageBackground}>
                    <div className={styles.pageImage}>
                      <Image imageUrl={imageUrl} alt='Sample Image' />
                    </div>
                  </div>
                ))}
              </div>
              <p className={styles.text}>{description}</p>
            </div>

            <StyledButton
              onClick={handleClose}
              className={styles.closeButtonBottom}
              aria-label='Close Modal'
            >
              {closeText}
            </StyledButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalClient;
