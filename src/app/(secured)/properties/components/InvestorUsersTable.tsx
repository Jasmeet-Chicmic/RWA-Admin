"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "react-toastify";

import FormattedDate from "@/components/atoms/FormattedDate";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import { TableColumn } from "@/components/atoms/Table";
import { InvestorUser } from "@/types/properties";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { walletTruncate } from "@/shared/utils";
import { fromBaseUnits } from "@/shared/utils/unitUtils";
import PropertyUsersTableBase from "./PropertyUsersTableBase";

interface InvestorUsersTableProps {
  data: InvestorUser[];
  totalCount: number;
  isLoading?: boolean;
}

const InvestorUsersTable = ({
  data,
  totalCount,
  isLoading = false,
}: InvestorUsersTableProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  const columns: TableColumn<InvestorUser>[] = useMemo(
    () => [
      // {
      //   title: t("name"),
      //   field: "name",
      //   render: (item: InvestorUser) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} font-medium`}>
      //       {item.name || "—"}
      //     </span>
      //   ),
      // },
      {
        title: t("walletAddress"),
        field: "walletAddress",
        render: (item: InvestorUser) => (
          <CopyToClipboardPill
            value={item.walletAddress}
            displayValue={walletTruncate(item.walletAddress)}
            title={tCommon("copy")}
            onCopied={() => toast.success(tCommon("copiedToClipboard"))}
          />
        ),
      },
      {
        title: t("sharesBought"),
        field: "sharesBought",
        align: "center",
        render: (item: InvestorUser) => (
          <span className={`font-medium ${TEXT_PRIMARY}`}>
            {fromBaseUnits(item.sharesBought).toLocaleString()}
          </span>
        ),
      },
      {
        title: t("createdAt"),
        field: "createdAt",
        render: (item: InvestorUser) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.createdAt ? <FormattedDate date={item.createdAt} /> : "—"}
          </span>
        ),
      },
    ],
    [t, tCommon],
  );

  return (
    <PropertyUsersTableBase<InvestorUser>
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      columns={columns}
      paginationTitle={t("investors").toLowerCase()}
      emptyMessage={t("noInvestorsFound")}
      title={t("investors")}
      description={t("allInvestorsForThisProperty")}
    />
  );
};

export default InvestorUsersTable;
