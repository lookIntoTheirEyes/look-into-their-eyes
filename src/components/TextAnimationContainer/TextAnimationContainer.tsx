"use client";
import { motion } from "framer-motion";

const TextAnimationContainer: React.FC<{ text: string }> = ({ text }) => {
  const charVariants = {
    hidden: { opacity: 0 },
    reveal: { opacity: 1 },
  };

  return (
    <motion.p
      initial='hidden'
      whileInView='reveal'
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.02 }}
    >
      {text.split("").map((c, i) => (
        <motion.span
          key={c + i}
          variants={charVariants}
          transition={{ duration: 0.1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          {c}
        </motion.span>
      ))}
    </motion.p>
  );
};

TextAnimationContainer.displayName = "TextAnimationContainer";
export default TextAnimationContainer;
