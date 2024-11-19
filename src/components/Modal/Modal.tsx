"use client";

import { motion, AnimatePresence } from "framer-motion";
import { startTransition, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import StyledButton from "../StyledButton/StyledButton";
import { IModalProps } from "@/lib/model/book";
import styles from "./Modal.module.css";

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
  children,
  paths: { curr, next },
  closeText,
  center,
}: IModalProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const page = useSearchParams().get("page");

  const handleClose = (
    event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    event.preventDefault();
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
    if (pathname.includes(curr.replace("/", ""))) {
      setIsVisible(true);
      checkScrollbar();
    }
  }, [pathname]);

  const handleExitComplete = () => {
    if (!isClosing) return;

    startTransition(() => {
      const query = page ? { page } : {};
      router.push({ pathname: `${next}`, query }, { scroll: false });
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
            <div
              ref={containerRef}
              className={`${styles.modalContent} ${
                hasScrollbar ? styles.scrollbar : ""
              } ${center ? styles.center : ""}`}
            >
              <button
                onClick={handleClose}
                className={styles.closeButton}
                aria-label='Close Modal'
              >
                X
              </button>
              {children}
              {closeText && (
                <StyledButton
                  onClick={handleClose}
                  className={styles.closeButtonBottom}
                  aria-label='Close Modal'
                >
                  {closeText}
                </StyledButton>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalClient;
