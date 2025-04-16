"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

const TextAnimationContainer: React.FC<{ text: string }> = ({ text }) => {
  const chunks = useMemo(() => {
    return text.split(/(\s+)/).filter(Boolean);
  }, [text]);

  const containerVariants = {
    hidden: { opacity: 0 },
    reveal: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const chunkVariants = {
    hidden: { opacity: 0 },
    reveal: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.p
      initial='hidden'
      whileInView='reveal'
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      {chunks.map((chunk, i) => (
        <motion.span key={chunk + i} variants={chunkVariants}>
          {chunk}
        </motion.span>
      ))}
    </motion.p>
  );
};

TextAnimationContainer.displayName = "TextAnimationContainer";
export default TextAnimationContainer;
