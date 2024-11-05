import Terms from "@/components/TermsAndConditions/TermsAndConditions";
import { Language } from "@/lib/model/language";

export default async function TermsPage(props: {
  params: Promise<{ locale: Language }>;
}) {
  const params = await props.params;
  return <Terms lang={params.locale} />;
}
