"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import styles from "./Modal.module.css";
import { useRouter, usePathname } from "@/i18n/routing";

import Image from "@/components/Image/Image";
import { Language } from "@/lib/model/language";
import StyledButton from "@/components/StyledButton/StyledButton";

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
  lang: locale,
  closeText,
}: IProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get("page");

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 500);
  };

  const checkScrollbar = () => {
    const container = containerRef.current;
    if (container) {
      const isScrollable = container.scrollHeight > container.clientHeight;
      setHasScrollbar(isScrollable);
    }
  };

  useEffect(() => {
    if (pathname.includes("details")) {
      setIsVisible(true);
      checkScrollbar();
    }
  }, [pathname]);

  const handleExitComplete = () => {
    if (!isClosing) return;

    startTransition(() => {
      router.push(
        { pathname: "/story", query: { page } },
        { locale, scroll: false }
      );
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
              className={`${styles.closeButton} ${
                hasScrollbar ? styles.scrollbar : ""
              }`}
              aria-label='Close Modal'
            >
              X
            </button>

            <div ref={containerRef} className={styles.modalContent}>
              <h2 className={styles.title}>{title}</h2>
              <div className={styles.pageImages}>
                {imageUrls.map((imageUrl, i) => (
                  <div key={imageUrl + i} className={styles.imageBackground}>
                    <div className={styles.pageImage}>
                      <Image imageUrl={imageUrl} alt={title} priority />
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
