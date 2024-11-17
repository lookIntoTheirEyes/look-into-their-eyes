import PageContainer from "@/components/PageContainer/PageContainer";
import { ILanguageProps, Language } from "@/lib/model/language";

const Families: React.FC<ILanguageProps> = async (props) => {
  const params = await props.params;

  const { locale } = params;

  return (
    <PageContainer center>
      <h1>{locale === Language.en ? "Families Narrating" : "משפחות מספרות"}</h1>
    </PageContainer>
  );
};

Families.displayName = "Families";
export default Families;
