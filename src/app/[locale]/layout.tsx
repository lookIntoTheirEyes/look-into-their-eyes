import "../globals.css";
import { ILanguageProps } from "../../lib/model/language";
import { getTranslations } from "next-intl/server";
import BaseLayout from "@/components/BaseLayout";
import { cookies } from "next/headers";

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
  const isMobile = (await cookies()).get("isMobile")?.value === "true";

  return (
    <BaseLayout locale={locale} isMobile={isMobile}>
      {children}
    </BaseLayout>
  );
}
