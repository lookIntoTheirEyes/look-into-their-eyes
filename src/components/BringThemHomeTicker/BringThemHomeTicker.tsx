"use client";
import { useEffect } from "react";

import { Language } from "@/lib/model/language";
import styles from "./BringThemHomeTicker.module.css";

const BringThemHomeTicker: React.FC<{ lang: Language }> = ({ lang }) => {
  useEffect(() => {
    const scriptId = "bthn-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.src = "https://bringthemhomenow.net/1.1.0/hostages-ticker.js";
    script.id = scriptId;
    script.setAttribute(
      "integrity",
      "sha384-DHuakkmS4DXvIW79Ttuqjvl95NepBRwfVGx6bmqBJVVwqsosq8hROrydHItKdsne"
    );
    script.setAttribute("crossorigin", "anonymous");
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [lang]);

  return <div id='bthn' lang={lang} className={styles.bthn}></div>;
};

export default BringThemHomeTicker;
