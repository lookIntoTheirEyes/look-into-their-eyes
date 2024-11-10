import PageContainer from "@/components/PageContainer/PageContainer";
import PrivacyPolicy from "@/components/PrivacyPolicy/PrivacyPolicy";
import { ILanguageProps } from "@/lib/model/language";

export default async function PrivacyPage(props: ILanguageProps) {
  const { locale } = await props.params;
  return (
    <PageContainer lang={locale}>
      <PrivacyPolicy />
    </PageContainer>
  );
}
