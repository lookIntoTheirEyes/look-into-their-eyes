"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./Modal.module.css";

import Image from "../Image/Image";

interface IProps {
  page?: number;
  title: string;
  imageUrls: string[];
  hero?: string;
  description?: string;
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
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const ModalClient = ({ title, description, imageUrls }: IProps) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence mode='wait' onExitComplete={() => router.back()}>
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
            <div className={styles.modalContent}>
              <h2 className={styles.title}>{title}</h2>
              <div className={styles.pageImages}>
                {imageUrls.map((imageUrl, i) => (
                  <div key={imageUrl + i} className={styles.pageImage}>
                    <Image imageUrl={imageUrl} alt='Sample Image' />
                  </div>
                ))}
              </div>
              <p className={styles.text}>{description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalClient;
