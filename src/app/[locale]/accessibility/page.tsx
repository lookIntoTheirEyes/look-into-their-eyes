import AccessibilityStatement from "@/components/Accessibility/AccessibilityStatement/AccessibilityStatement";
import { Language } from "@/lib/model/language";

export default async function Accessibility(props: {
  params: Promise<{ locale: Language }>;
}) {
  const { locale } = await props.params;
  return <AccessibilityStatement lang={locale} />;
}
