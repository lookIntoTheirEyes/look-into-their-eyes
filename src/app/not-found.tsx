import BaseLayout from "@/components/BaseLayout/BaseLayout";
import NotFoundPage from "@/components/NotFoundPage/NotFoundPage";
import { routing } from "@/i18n/routing";
import { cookies } from "next/headers";

export default async function GlobalNotFound() {
  const isMobile = (await cookies()).get("isMobile")?.value === "true";
  return (
    <BaseLayout isMobile={isMobile} locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
