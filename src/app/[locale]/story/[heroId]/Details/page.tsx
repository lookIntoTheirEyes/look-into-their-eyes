"use client";
import { useRouter } from "next/navigation";
import Dialog from "@/components/Book/Dialog/Dialog";

export default function HeroDetails({
  params: { page },
}: {
  params: { page: string };
}) {
  const router = useRouter();
  const handleClose = () => {
    router.back();
  };
  return <Dialog message={page} onClose={handleClose} />;
}
