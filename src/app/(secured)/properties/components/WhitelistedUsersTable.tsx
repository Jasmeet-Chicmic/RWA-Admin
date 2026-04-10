"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "react-toastify";

import FormattedDate from "@/components/atoms/FormattedDate";
import CopyToClipboardPill from "@/components/atoms/CopyToClipboardPill/CopyToClipboardPill";
import { TableColumn } from "@/components/atoms/Table";
import { WhitelistedUser } from "@/types/properties";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { walletTruncate } from "@/shared/utils";
import PropertyUsersTableBase from "./PropertyUsersTableBase";

interface WhitelistedUsersTableProps {
  data: WhitelistedUser[];
  totalCount: number;
  isLoading?: boolean;
  searchText?: string;
  onSearchChange?: (value: string) => void;
}

const WhitelistedUsersTable = ({
  data,
  totalCount,
  isLoading = false,
  searchText = "",
  onSearchChange,
}: WhitelistedUsersTableProps) => {
  const t = useTranslations("properties");
  const tCommon = useTranslations("common");

  const columns: TableColumn<WhitelistedUser>[] = useMemo(
    () => [
      // {
      //   title: t("name"),
      //   field: "name",
      //   render: (item: WhitelistedUser) => (
      //     <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} font-medium`}>
      //       {item.name || "—"}
      //     </span>
      //   ),
      // },
      {
        title: t("walletAddress"),
        field: "walletAddress",
        render: (item: WhitelistedUser) => (
          <CopyToClipboardPill
            value={item.walletAddress}
            displayValue={walletTruncate(item.walletAddress)}
            title={tCommon("copy")}
            onCopied={() => toast.success(tCommon("copiedToClipboard"))}
          />
        ),
      },
      {
        title: t("whitelistedAt"),
        field: "whitelistedAt",
        align: "center",
        render: (item: WhitelistedUser) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.whitelistedAt ? (
              <FormattedDate date={item.whitelistedAt} />
            ) : (
              "—"
            )}
          </span>
        ),
      },
      {
        title: t("createdAt"),
        field: "createdAt",
        render: (item: WhitelistedUser) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.createdAt ? <FormattedDate date={item.createdAt} /> : "—"}
          </span>
        ),
      },
    ],
    [t, tCommon],
  );

  return (
    <PropertyUsersTableBase<WhitelistedUser>
      data={data}
      totalCount={totalCount}
      isLoading={isLoading}
      columns={columns}
      paginationTitle={t("whitelisted").toLowerCase()}
      emptyMessage={t("noWhitelistedUsersFound")}
      title={t("whitelistedUsers")}
      description={t("allWhitelistedUsersForThisProperty")}
      searchPlaceholder={t("searchWhitelistedUsersPlaceholder")}
      searchValue={searchText}
      onSearchChange={onSearchChange}
    />
  );
};

export default WhitelistedUsersTable;
