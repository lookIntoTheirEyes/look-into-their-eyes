import "../globals.css";
import { Language } from "../model/language";

export async function generateMetadata({ params: { locale } }) {
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
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
