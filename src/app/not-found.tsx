import BaseLayout from "@/components/BaseLayout";
import NotFoundPage from "@/components/NotFoundPage/NotFoundPage";
import { routing } from "@/i18n/routing";

export default function GlobalNotFound() {
  return (
    <BaseLayout locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
