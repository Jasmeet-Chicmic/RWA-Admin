"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import { BroadcastChannel } from "../helpers/types";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import Image from "next/image";

interface BroadcastChannelsTableProps {
  data: BroadcastChannel[];
  totalCount: number;
  searchText: string;
}

const BroadcastChannelsTable = ({
  data,
  totalCount,
}: BroadcastChannelsTableProps) => {
  const router = useRouter();
  const t = useTranslations("broadcastMessages");

  const config: DataTableConfig<BroadcastChannel> = useMemo(() => {
    const columns: TableColumn<BroadcastChannel>[] = [
      {
        field: "iconUrl",
        title: t("Icon"),
        render: (item) => {
          if (item.iconUrl) {
            return (
              <div className="flex items-center">
                <Image
                  src={item.iconUrl}
                  alt={item.title}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
            );
          }
          return (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                {item.title.charAt(0).toUpperCase()}
              </span>
            </div>
          );
        },
        sortable: false,
      },
      {
        field: "title",
        title: t("Channel Name"),
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY} font-medium`}>
            {item.title}
          </span>
        ),
        sortable: false,
      },
      {
        field: "",
        title: t("Actions"),
        render: (item) => (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/broadcast-messages/view/${item.threadId}`);
              }}
              className="text-gray-500 hover:text-primarycolor dark:hover:text-secondarycolor transition-colors dark:text-sidebartext"
              title={t("View Messages")}
            >
              <Eye size={18} />
            </button>
          </div>
        ),
        fixed: "right",
        sortable: false,
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.threadId,
      paginationTitle: "broadcast channels",
      hideSelectCol: true,
      emptyMessage: t("No broadcast channels found"),
      searchPlaceholder: t("Search channels"),
      header: (
        <div className="mb-4">
          <h2
            className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
          >
            {t("Broadcast Channels")}
          </h2>
          <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
            {t("Manage and view broadcast message channels")}
          </p>
        </div>
      ),
    };
  }, [t, router]);

  return (
    <DataTable<BroadcastChannel>
      data={data}
      totalCount={totalCount}
      config={config}
    />
  );
};

export default BroadcastChannelsTable;
