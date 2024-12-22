"use client";

import { motion, AnimatePresence } from "framer-motion";
import { startTransition, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IModalProps } from "@/lib/model/common";
import { useRouter, usePathname } from "@/i18n/routing";
import StyledButton from "@/components/StyledButton/StyledButton";
import styles from "./Modal.module.css";

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
    if (pathname !== curr) {
      return;
    }

    setIsVisible(true);
    checkScrollbar();
  }, [pathname, curr]);

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
        <motion.div onClick={handleClose} className={styles.backdrop}>
          <motion.dialog
            aria-modal
            initial={{
              opacity: 0,
              scale: 0,
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className={styles.modal}
            open
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
                aria-label='close'
              >
                X
              </button>
              {children}
              {closeText && (
                <StyledButton
                  onClick={handleClose}
                  className={styles.closeButtonBottom}
                  aria-label='close'
                >
                  {closeText}
                </StyledButton>
              )}
            </div>
          </motion.dialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalClient;
