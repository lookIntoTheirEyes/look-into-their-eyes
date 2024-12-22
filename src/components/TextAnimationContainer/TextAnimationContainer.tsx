"use client";

import { useSprings, a, config } from "@react-spring/web";
import { useInView } from "@react-spring/web";

const TextAnimationContainer = ({ text }: { text: string }) => {
  const [ref, inView] = useInView();

  const chunks = text.split(/\s+/).reduce((acc: string[], word, i) => {
    const chunkIndex = Math.floor(i / 3);
    if (!acc[chunkIndex]) acc[chunkIndex] = "";
    acc[chunkIndex] += word + " ";
    return acc;
  }, []);

  const springs = useSprings(
    chunks.length,
    chunks.map((_, index) => ({
      from: { opacity: 0 },
      to: { opacity: inView ? 1 : 0 },
      config: config.gentle,
      delay: index * 200,
    }))
  );

  return (
    <p ref={ref}>
      {springs.map((spring, index) => (
        <a.span key={index} style={spring}>
          {chunks[index]}
        </a.span>
      ))}
    </p>
  );
};

export default TextAnimationContainer;
