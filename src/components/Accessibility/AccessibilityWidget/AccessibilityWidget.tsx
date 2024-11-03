"use client";
import { Language } from "@/lib/model/language";
import { Accessibility } from "accessibility";
import { useEffect } from "react";

const AccessibilityWidget: React.FC<{
  locale: Language;
}> = ({ locale }) => {
  useEffect(() => {
    const defaultOptions = {
      session: {
        persistent: false,
      },
    };
    const accessibilityOptions =
      locale === Language.he
        ? { ...getHebrewOptions(), ...defaultOptions }
        : defaultOptions;

    new Accessibility(accessibilityOptions);
  }, [locale]);

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
    textToSpeechLang: "he-IL",
    speechToTextLang: "he-IL",
  };

  return options;
}
