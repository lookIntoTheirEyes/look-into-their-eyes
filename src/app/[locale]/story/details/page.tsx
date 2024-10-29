import ModalClient from "@/components/Modal/Modal";

const HeroDetails = async ({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) => {
  const page = searchParams.page
    ? Array.isArray(searchParams.page)
      ? searchParams.page[0]
      : searchParams.page
    : "";

  return <ModalClient page={+page} />;
};

export default HeroDetails;
