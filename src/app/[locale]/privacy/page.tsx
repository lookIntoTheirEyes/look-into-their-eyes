import PageContainer from "@/components/PageContainer/PageContainer";
import PrivacyPolicy from "@/components/PrivacyPolicy/PrivacyPolicy";
import { Language } from "@/lib/model/language";

export default async function PrivacyPage(props: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await props.params;
  return (
    <PageContainer lang={locale}>
      <PrivacyPolicy />
    </PageContainer>
  );
}
