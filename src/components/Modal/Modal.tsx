"use client";

import { useTransition, animated, config } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IModalProps } from "@/lib/model/common";
import { useRouter, usePathname } from "@/i18n/routing";
import StyledButton from "@/components/StyledButton/StyledButton";
import styles from "./Modal.module.css";

const ANIMATION_DURATION = 500;

const ModalClient = ({
  children,
  paths: { curr, next },
  closeText,
  center,
}: IModalProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrollbar, setHasScrollbar] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const page = useSearchParams().get("page");

  const handleClose = (
    event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsVisible(false);
    const query = page ? { page } : {};
    router.push({ pathname: `${next}`, query }, { scroll: false });
  };

  const checkScrollbar = () => {
    const container = containerRef.current;
    if (container) {
      const isScrollable = container.scrollHeight > container.clientHeight;
      setHasScrollbar(isScrollable);
    }
  };

  useEffect(() => {
    if (pathname !== curr) return;
    setIsVisible(true);
    checkScrollbar();
  }, [pathname, curr]);

  const transitions = useTransition(isVisible, {
    from: { opacity: 0, scale: 0 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0 },
    config: { tension: 300, friction: 20, duration: ANIMATION_DURATION },
  });

  const backdropTransition = useTransition(isVisible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { ...config.stiff, duration: ANIMATION_DURATION },
  });

  return (
    <>
      {backdropTransition((style, item) =>
        item ? (
          <animated.div
            onClick={handleClose}
            className={styles.backdrop}
            style={style}
          >
            {transitions((modalStyle, modalItem) =>
              modalItem ? (
                <animated.dialog
                  aria-modal
                  style={modalStyle}
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
                </animated.dialog>
              ) : null
            )}
          </animated.div>
        ) : null
      )}
    </>
  );
};

export default ModalClient;
