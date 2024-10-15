import Header from "@/components/Header/Header";
import "../globals.css";
import { Language } from "../model/language";
import BringThemHomeTicker from "@/components/BringThemHomeTicker/BringThemHomeTicker";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Language };
}) {
  const title =
    locale === Language.en ? "Look in their eyes" : "הסתכלו להם בעיניים";
  const description =
    locale === Language.en ? "Look in their eyes" : "הסתכלו להם בעיניים";

  return {
    title,
    description,
  };
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Language };
}) {
  return (
    <html lang={locale} dir={locale === Language.en ? "ltr" : "rtl"}>
      <body>
        <Header />
        {children}
        <BringThemHomeTicker lang={locale} key={locale} />
      </body>
    </html>
  );
}
