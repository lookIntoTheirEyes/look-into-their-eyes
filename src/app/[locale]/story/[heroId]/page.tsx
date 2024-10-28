const HeroPage = ({ params }: { params: { page: "string" } }) => {
  console.log("page", params);

  return (
    <div>
      hero page - {params.page}
      {/* <h1>Page {pageId}</h1> */}
    </div>
  );
};

export default HeroPage;
