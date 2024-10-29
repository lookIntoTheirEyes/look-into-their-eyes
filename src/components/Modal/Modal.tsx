"use client";

import { motion } from "framer-motion";
import styles from "./modal.module.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.2,
    rotate: 180,
    transition: { duration: 0.5 },
  },
  visible: {
    opacity: 1,
    scale: 1.2,
    rotate: 0,
    transition: { duration: 0.5 },
  },
  exit: {
    opacity: 0,
    scale: 0.2,
    rotate: 180,
    transition: { duration: 0.5 },
  },
};

const backdropVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.5 },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const ModalClient = ({ page }: { page: number }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    if (backdropRef.current && modalRef.current) {
      backdropRef.current.style.transition = "opacity 0.5s";
      backdropRef.current.style.opacity = "0";

      modalRef.current.style.transition = "opacity 0.5s, transform 0.5s";
      modalRef.current.style.opacity = "0";
      modalRef.current.style.transform = "scale(0.2) rotate(180deg)";

      setTimeout(() => {
        setIsOpen(false);
        router.back();
      }, 500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <motion.div
        aria-modal='true'
        ref={backdropRef}
        onClick={handleClose}
        className={`${styles.backdrop}`}
        initial='hidden'
        animate='visible'
        exit='hidden'
        variants={backdropVariants}
      />
      <motion.dialog
        ref={modalRef}
        className={styles.modal}
        open
        variants={modalVariants}
        initial='hidden'
        animate='visible'
        exit='hidden'
      >
        <div>Details - {page}</div>
      </motion.dialog>
    </>
  );
};
export default ModalClient;
