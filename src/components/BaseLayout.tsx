import Header from "@/components/Header/Header";
import "../app/globals.css";
import { Language } from "@/lib/model/language";
import Footer from "@/components/Footer/Footer";
import Widgets from "@/components/Widgets/Widgets";
import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Analytics } from "@vercel/analytics/react";
import { ReactNode } from "react";

type IProps = {
  children: ReactNode;
  locale: Language;
};

export async function generateMetadata() {
  const t = await getTranslations("Metadata");

  const title = t("layout.title");
  const description = t("layout.description");

  return {
    title,
    description,
  };
}

export default async function BaseLayout({ children, locale }: IProps) {
  const messages = await getMessages();

  const t = await getTranslations("Links");

  return (
    <html lang={locale} dir={locale === Language.en ? "ltr" : "rtl"}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header
            locale={locale}
            links={{
              story: t("story"),
              home: t("home"),
              about: t("about"),
              families: t("families"),
              visitors: t("visitors"),
            }}
            logoText={t("logoText")}
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
