"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { AdminPromoCodeDetails } from "@/api/promoCodes";
import Table, { TableColumn } from "@/components/atoms/Table";
import {
  PROMO_DISCOUNT_TYPE,
  PROMO_DISCOUNT_TYPE_LABELS,
  PROMO_DURATION,
  PROMO_DURATION_LABELS,
} from "@/shared/constants";
import FormattedDate from "@/components/atoms/FormattedDate";

type Props = {
  promoCode: AdminPromoCodeDetails;
};

type RedeemedUser = AdminPromoCodeDetails["users"][number];

const PromoCodeView = ({ promoCode }: Props) => {
  const router = useRouter();
  const t = useTranslations("promoCodes");

  const users: RedeemedUser[] = promoCode.users ?? [];

  const userColumns: TableColumn<RedeemedUser>[] = [
    { title: t("userName"), field: "userName" },
    { title: t("email"), field: "email" },
    {
      title: t("usedAt"),
      field: "usedAt",
      render: (item) =>
        item.usedAt ? <FormattedDate date={item.usedAt} /> : "-",
    },
    {
      title: t("stripeSubscriptionId"),
      field: "stripeSubscriptionId",
      render: (item) => item.stripeSubscriptionId || "-",
    },
  ];

  const discountLabel = (() => {
    const type = promoCode.discountType as PROMO_DISCOUNT_TYPE | undefined;
    const value = promoCode.discountValue;
    if (!type || value == null) return "-";
    if (type === PROMO_DISCOUNT_TYPE.PERCENTAGE) {
      return `${value}% (${PROMO_DISCOUNT_TYPE_LABELS[type]})`;
    }
    return `${value} ${promoCode.currency || ""} (${PROMO_DISCOUNT_TYPE_LABELS[type]})`;
  })();

  const durationLabel = (() => {
    const duration = promoCode.duration as PROMO_DURATION | undefined;
    if (!duration) return "-";
    const label = PROMO_DURATION_LABELS[duration];
    if (duration === PROMO_DURATION.REPEATING && promoCode.durationInMonths) {
      return `${label} (${promoCode.durationInMonths} ${t("months")})`;
    }
    return label;
  })();

  return (
    <div className="">
      <div className="bg-bgwhite px-5 3xl:px-6 pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] dark:bg-darkbgprimary dark:border-darkbordercolor1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-textprimary dark:text-sidebartext">
              {t("promoCodeDetails")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {promoCode.code}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[0_0_20px_20px] mb-4 border-t border-bordercolor1 dark:border-darkbordercolor1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Info label={t("code")} value={promoCode.code} />
          <Info label={t("description")} value={promoCode.description || "-"} />
          <Info label={t("discount")} value={discountLabel} />
          <Info label={t("duration")} value={durationLabel} />
          <Info
            label={t("validFrom")}
            value={
              promoCode.validFrom ? (
                <FormattedDate date={promoCode.validFrom} />
              ) : (
                "-"
              )
            }
          />
          <Info
            label={t("validUntil")}
            value={
              promoCode.validUntil ? (
                <FormattedDate date={promoCode.validUntil} />
              ) : (
                "-"
              )
            }
          />
          <Info
            label={t("isActive")}
            value={promoCode.isActive ? t("active") : t("inactive")}
          />
          <Info
            label={t("maxRedemptions")}
            value={String(promoCode.maxRedemptions ?? 0)}
          />
          <Info
            label={t("redemptions")}
            value={String(promoCode.redemptionCount ?? 0)}
          />
        </div>
      </div>

      <div className="bg-bgwhite dark:bg-darkbgprimary rounded-[20px] border border-bordercolor1 dark:border-darkbordercolor1 overflow-hidden">
        <div className="px-6 py-4 border-b border-bordercolor1 dark:border-bordercolor2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-textprimary dark:text-sidebartext">
              {t("redeemedUsers")}
            </h3>
            <span className="text-sm font-medium text-textparagraph dark:text-textparagraphlight">
              {users.length}
            </span>
          </div>
        </div>

        <Table<RedeemedUser>
          data={users}
          columns={userColumns}
          keyExtractor={(item) => item.userId}
          emptyMessage={t("noUsersHaveRedeemedThisPromoCodeYet")}
          onRowClick={(item) => {
            if (item.userId) {
              router.push(`/users/view/${item.userId}/account`, {
                scroll: false,
              });
            }
          }}
        />
      </div>
    </div>
  );
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) => (
  <div className="rounded-xl border border-bordercolor1 dark:border-bordercolor2 p-4">
    <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-white/60 uppercase">
      {label}
    </div>
    <div className="mt-1 text-sm font-medium text-textprimary dark:text-sidebartext break-words">
      {value}
    </div>
  </div>
);

export default PromoCodeView;
