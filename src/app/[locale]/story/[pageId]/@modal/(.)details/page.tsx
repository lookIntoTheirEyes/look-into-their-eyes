import ModalClient from "@/components/Modal/Modal";

export default function ModalPage({
  params,
}: {
  params: {
    pageId: string;
  };
}) {
  console.log("params ModalPage", params);
  return <ModalClient page={+params.pageId} />;
}
