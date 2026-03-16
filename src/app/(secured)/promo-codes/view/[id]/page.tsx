import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  AdminPromoCodeDetails,
  getAdminPromoCodeByIdAction,
} from "@/api/promoCodes";
import { ResponseType } from "@/shared/types";
import PromoCodeView from "./PromoCodeView";
import { PRIVATE_ROUTES } from "@/shared/routes";

type PromoCodeDetailsResponse = Omit<ResponseType, "data"> & {
  data: AdminPromoCodeDetails;
};

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const t = await getTranslations("promoCodes");

  const res = (await getAdminPromoCodeByIdAction(
    id,
  )) as PromoCodeDetailsResponse;

  if (!res?.status) {
    return notFound();
  }

  if (!res?.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-2">
            {t("Promo code not found")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Back to list */}
      <div className="flex mt-[20px] mb-2">
        <Link
          href={PRIVATE_ROUTES.PROMO_CODES_LIST}
          className="inline-flex items-center gap-2 text-sm font-medium text-textparagraph dark:text-textparagraphlight hover:text-primarycolor dark:hover:text-primarycolor transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("Back to promo codes")}</span>
        </Link>
      </div>

      <div className="space-y-0 bg-white dark:bg-darkbgbase mt-6">
        <PromoCodeView promoCode={res.data} />
      </div>
    </>
  );
};

export default Page;
