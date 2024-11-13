"use client";
import { Language } from "@/lib/model/language";
import { Accessibility } from "accessibility";
import { useEffect } from "react";

const AccessibilityWidget: React.FC<{
  lang: Language;
}> = ({ lang }) => {
  useEffect(() => {
    const speechLang = lang === Language.he ? "he-IL" : "en-US";

    const defaultOptions = {
      session: {
        persistent: true,
      },
      language: {
        textToSpeechLang: speechLang,
        speechToTextLang: speechLang,
      },
      icon: {
        img: "accessible",
      },
    };
    const accessibilityOptions =
      lang === Language.he
        ? { ...getHebrewOptions(), ...defaultOptions }
        : defaultOptions;

    const accessibility = new Accessibility(accessibilityOptions);
    return () => {
      accessibility.destroy();
    };
  }, [lang]);

  return null;
};

export default AccessibilityWidget;

function getHebrewOptions() {
  const labels = {
    increaseText: "הגדלת גודל טקסט",
    decreaseText: "הקטנת גודל טקסט",
    increaseTextSpacing: "הגדלת רווחי טקסט",
    decreaseTextSpacing: "הקטנת רווחי טקסט",
    increaseLineHeight: "הגדלת גובה שורה",
    decreaseLineHeight: "הקטנת גובה שורה",
    invertColors: "הפיכת צבעים",
    grayHues: "גווני אפור",
    underlineLinks: "קו תחתון לקישורים",
    bigCursor: "סמן גדול",
    readingGuide: "מדריך קריאה",
    textToSpeech: "טקסט לדיבור",
    speechToText: "דיבור לטקסט",
    disableAnimations: "כיבוי אנימציות",
    hotkeyPrefix: "מקש חם: ",
  };
  const options = {
    labels,
  };

  return options;
}
