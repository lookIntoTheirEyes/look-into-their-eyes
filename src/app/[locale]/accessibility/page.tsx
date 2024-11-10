import AccessibilityStatement from "@/components/Accessibility/AccessibilityStatement/AccessibilityStatement";
import PageContainer from "@/components/PageContainer/PageContainer";
import { Language } from "@/lib/model/language";

export default async function Accessibility(props: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await props.params;
  return (
    <PageContainer lang={locale}>
      <AccessibilityStatement lang={locale} />
    </PageContainer>
  );
}
