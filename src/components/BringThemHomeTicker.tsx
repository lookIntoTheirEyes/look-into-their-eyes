import { Language } from "@/app/model/language";
import Script from "next/script";

const BringThemHomeTicker: React.FC<{ lang: Language }> = ({ lang }) => {
  return (
    <>
      <div id='bthn' lang={lang}></div>
      <Script
        src='https://bringthemhomenow.net/1.1.0/hostages-ticker.js'
        strategy='afterInteractive'
        integrity='sha384-DHuakkmS4DXvIW79Ttuqjvl95NepBRwfVGx6bmqBJVVwqsosq8hROrydHItKdsne'
        crossOrigin='anonymous'
      />
    </>
  );
};

export default BringThemHomeTicker;
