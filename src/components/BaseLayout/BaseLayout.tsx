import { getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Widgets from "@/components/Widgets/Widgets";
import { Analytics } from "@vercel/analytics/react";
import { Language } from "@/lib/model/language";
import styles from "./BaseLayout.module.css";

type IProps = {
  children: ReactNode;
  locale: Language;
  isMobile: boolean;
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

export default async function BaseLayout({
  children,
  locale,
  isMobile,
}: IProps) {
  const messages = await getMessages();

  const t = await getTranslations("Links");

  return (
    <html lang={locale} dir={locale === Language.en ? "ltr" : "rtl"}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header
            isMobile={isMobile}
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
          <main className={styles.main}>{children}</main>
          <Footer />

          <Widgets lang={locale} />
          {/* <Analytics /> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
