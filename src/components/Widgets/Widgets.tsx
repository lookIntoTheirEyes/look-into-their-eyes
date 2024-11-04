import { Language } from "@/lib/model/language";
import AccessibilityWidget from "../Accessibility/AccessibilityWidget/AccessibilityWidget";
import BringThemHomeTicker from "../BringThemHomeTicker/BringThemHomeTicker";

const Widgets: React.FC<{
  lang: Language;
}> = ({ lang }) => {
  return (
    <>
      <AccessibilityWidget lang={lang} />
      <BringThemHomeTicker lang={lang} />
    </>
  );
};

export default Widgets;
