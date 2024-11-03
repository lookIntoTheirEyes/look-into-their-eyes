import Header from "@/components/Header/Header";
import "../globals.css";
import { Language } from "../../lib/model/language";
import BringThemHomeTicker from "@/components/BringThemHomeTicker/BringThemHomeTicker";
import Footer from "@/components/Footer/Footer";
import AccessibilityWidget from "@/components/Accessibility/AccessibilityWidget/AccessibilityWidget";

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
        <AccessibilityWidget locale={locale} />
        <Header />
        <main>{children}</main>
        <BringThemHomeTicker lang={locale} />
        <Footer locale={locale} />
      </body>
    </html>
  );
}
