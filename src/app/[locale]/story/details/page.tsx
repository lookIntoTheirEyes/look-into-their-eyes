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
  console.log("Page:", page);

  return <div>Details - {page}</div>;
};

export default HeroDetails;
