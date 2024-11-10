import PageContainer from "@/components/PageContainer/PageContainer";
import Terms from "@/components/TermsAndConditions/TermsAndConditions";
import { ILanguageProps } from "@/lib/model/language";

export default async function TermsPage(props: ILanguageProps) {
  const { locale } = await props.params;
  return (
    <PageContainer lang={locale}>
      <Terms />
    </PageContainer>
  );
}
