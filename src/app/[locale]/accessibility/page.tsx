import AccessibilityStatement from "@/components/Accessibility/AccessibilityStatement/AccessibilityStatement";
import PageContainer from "@/components/PageContainer/PageContainer";
import { ILanguageProps } from "@/lib/model/language";

export default async function Accessibility(props: ILanguageProps) {
  const { locale } = await props.params;
  return (
    <PageContainer lang={locale}>
      <AccessibilityStatement />
    </PageContainer>
  );
}
