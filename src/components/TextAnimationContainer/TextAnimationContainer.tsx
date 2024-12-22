"use client";

import { useSpring, a, config } from "@react-spring/web";
import { useInView } from "@react-spring/web";

const TextAnimationContainer = ({ text }: { text: string }) => {
  const [ref, inView] = useInView();

  const chunks = text.split(/\s+/).reduce((acc: string[], word, i) => {
    const chunkIndex = Math.floor(i / 3);
    if (!acc[chunkIndex]) acc[chunkIndex] = "";
    acc[chunkIndex] += word + " ";
    return acc;
  }, []);

  const springs = chunks.map((_, index) =>
    useSpring({
      from: { opacity: 0 },
      to: { opacity: inView ? 1 : 0 },
      config: config.gentle,
      delay: index * 200,
    })
  );

  return (
    <p ref={ref}>
      {chunks.map((chunk, index) => (
        <a.span key={index} style={springs[index]}>
          {chunk}
        </a.span>
      ))}
    </p>
  );
};

export default TextAnimationContainer;
