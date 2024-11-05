import Header from "@/components/Header/Header";
import "../globals.css";
import { Language } from "../../lib/model/language";
import Footer from "@/components/Footer/Footer";
import Widgets from "@/components/Widgets/Widgets";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(props: {
  params: Promise<{ locale: Language }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const title =
    locale === Language.en ? "Look in their eyes" : "הסתכלו להם בעיניים";
  const description =
    locale === Language.en ? "Look in their eyes" : "הסתכלו להם בעיניים";

  return {
    title,
    description,
  };
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: Language }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  const t = await getTranslations("Links");

  return (
    <html lang={locale} dir={locale === Language.en ? "ltr" : "rtl"}>
      <body>
        <Header
          locale={locale}
          links={{ story: t("story"), home: t("home"), about: t("about") }}
        />
        <main>{children}</main>
        <Footer locale={locale} />

        <Widgets lang={locale} />
      </body>
    </html>
  );
}
