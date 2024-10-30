import ModalClient from "@/components/Modal/Modal";
import { getPageNum, SearchParams } from "@/lib/utils/utils";

const HeroDetails = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const page = getPageNum(searchParams);

  return <ModalClient page={+page} />;
};

export default HeroDetails;
