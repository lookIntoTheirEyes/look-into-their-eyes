import PageContainer from "@/components/PageContainer/PageContainer";
import { ILanguageProps, Language } from "@/lib/model/language";

const Visitors: React.FC<ILanguageProps> = async (props) => {
  const params = await props.params;

  const { locale } = params;

  return (
    <PageContainer center>
      <h1>{locale === Language.en ? "Visitors Book" : "ספר מבקרים"}</h1>
    </PageContainer>
  );
};

Visitors.displayName = "Families";
export default Visitors;
