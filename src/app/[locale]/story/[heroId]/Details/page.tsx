"use client";
import { useRouter } from "next/navigation";
import Dialog from "@/components/Book/Dialog/Dialog";

export default function Hero({
  params: { heroId },
}: {
  params: { heroId: string };
}) {
  const router = useRouter();
  const handleClose = () => {
    router.back();
  };
  return <Dialog message={heroId} onClose={handleClose} />;
}
