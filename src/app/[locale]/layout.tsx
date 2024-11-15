import Header from "@/components/Header/Header";
import "../globals.css";
import { ILanguageProps, Language } from "../../lib/model/language";
import Footer from "@/components/Footer/Footer";
import Widgets from "@/components/Widgets/Widgets";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Analytics } from "@vercel/analytics/react";

interface IProps extends ILanguageProps {
  children: React.ReactNode;
}

export async function generateMetadata() {
  const t = await getTranslations("Metadata");

  const title = t("layout.title");
  const description = t("layout.description");

  return {
    title,
    description,
  };
}

export default async function RootLayout(props: IProps) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;
  const messages = await getMessages();

  const t = await getTranslations("Links");

  return (
    <html lang={locale} dir={locale === Language.en ? "ltr" : "rtl"}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header
            locale={locale}
            links={{ story: t("story"), home: t("home"), about: t("about") }}
          />
          {children}
          <Footer />

          <Widgets lang={locale} />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
