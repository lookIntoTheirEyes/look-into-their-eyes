import ModalClient from "@/components/Modal/Modal";

export default function ModalPage({
  params: { pageId },
}: {
  params: {
    pageId: string;
  };
}) {
  return <ModalClient page={+pageId} />;
}
