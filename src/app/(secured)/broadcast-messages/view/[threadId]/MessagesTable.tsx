"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { sendBroadcastMessageAction } from "@/api/broadcast";
import type { TableColumn } from "@/components/atoms/Table";
import TableActions, {
  TableActionDisplayMode,
} from "@/components/atoms/TableActions";
import CustomModal from "@/components/molecules/CustomModal";
import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import { Eye } from "lucide-react";
import type { Message } from "../../helpers/types";

interface MessagesTableProps {
  messages: Message[];
  totalCount: number;
  threadId: string;
}

const MessagesTable = ({
  messages,
  totalCount,
  threadId,
}: MessagesTableProps) => {
  const t = useTranslations("broadcastMessages");
  const common = useTranslations("common");
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMessage, setViewMessage] = useState<Message | null>(null);
  const actionsDisplayMode: TableActionDisplayMode = "dropdown";

  const columns: TableColumn<Message>[] = useMemo(
    () => [
      //   {
      //     field: "sender",
      //     title: t("sender"),
      //     render: (item) => {
      //       const s = item.sender;
      //       const name =
      //         [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") ||
      //         "—";
      //       return (
      //         <div className="flex flex-col">
      //           <span className={`${TEXT_SIZE_SM} font-medium`}>{name}</span>
      //           <span className="text-xs text-textparagraph dark:text-textparagraphlight">
      //             {s.email || "—"}
      //           </span>
      //         </div>
      //       );
      //     },
      //     sortable: false,
      //   },
      {
        field: "messageText",
        title: t("messageTitle"),
        render: (item) => (
          <span
            className={`${TEXT_SIZE_SM} text-textparagraph dark:text-textparagraphlight line-clamp-1 max-w-xs`}
            title={item.messageText}
          >
            {item.messageText}
          </span>
        ),
        sortable: false,
      },
      {
        field: "createdAt",
        title: t("sentAt"),
        render: (item) => (
          <span className={TEXT_SIZE_SM}>
            {new Date(item.createdAt).toLocaleString()}
          </span>
        ),
        sortable: false,
      },
      {
        field: "",
        title: t("actions"),
        render: (item) => (
          <TableActions
            displayMode={actionsDisplayMode}
            actions={[
              {
                id: "view",
                label: common("View"),
                icon: <Eye size={16} />,
                onClick: () => setViewMessage(item),
              },
            ]}
          />
        ),
        sortable: false,
      },
    ],
    [common, t],
  );

  const config: DataTableConfig<Message> = useMemo(
    () => ({
      columns,
      keyExtractor: (m) => m.id,
      paginationTitle: "messages",
      hideSelectCol: true,
      emptyMessage: t("noMessagesFound"),
      searchPlaceholder: t("searchMessagesPlaceholder"),
      header: (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              className={`text-[1.25rem] lg:text-[1.5rem] font-bold ${TEXT_PRIMARY}`}
            >
              {t("messagesTitle")}
            </h2>
            <p className="text-[14px] font-medium text-textparagraph dark:text-textparagraphlight">
              {t("messagesSubtitle")}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center rounded-lg bg-primarycolor px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-primaryhover dark:bg-secondarycolor dark:text-black dark:hover:bg-secondaryhover"
            >
              {t("broadcastMessage")}
            </button>
          </div>
        </div>
      ),
    }),
    [columns, t],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageText.trim()) return;

      try {
        setIsSubmitting(true);
        const res = await sendBroadcastMessageAction({
          threadId,
          messageText: messageText.trim(),
          attachments: [],
        });

        if (res.status) {
          toast.success(res.message || t("messageSentSuccessfully"));
          setIsModalOpen(false);
          setMessageText("");
          router.refresh();
        } else {
          toast.error(res.message || t("failedToSendMessage"));
        }
      } catch (error) {
        console.error("Error sending broadcast message:", error);
        toast.error(t("failedToSendMessage"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [messageText, threadId, router, t],
  );

  return (
    <>
      <DataTable<Message>
        data={messages}
        totalCount={totalCount}
        config={config}
      />

      {/* View full message modal */}
      <CustomModal
        isOpen={!!viewMessage}
        onClose={() => setViewMessage(null)}
        title={t("messageTitle")}
        size="md"
      >
        {viewMessage && (
          <div className="max-h-80 overflow-y-auto custom-scrollbar text-sm whitespace-pre-wrap break-words text-textprimary dark:text-sidebartext">
            {viewMessage.messageText}
          </div>
        )}
      </CustomModal>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={t("broadcastMessage")}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("messageTitle")}
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-bordercolor1 dark:border-darkbordercolor1 bg-bgwhite dark:bg-darkbgprimary px-3 py-2 text-sm text-textprimary dark:text-sidebartext focus:outline-none focus:ring-2 focus:ring-primarycolor dark:focus:ring-secondarycolor"
              placeholder={t("typeMessagePlaceholder")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="inline-flex items-center rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 bg-transparent px-4 py-2 text-sm font-medium text-textparagraph dark:text-textparagraphlight hover:bg-bglight dark:hover:bg-darkbgbase"
              disabled={isSubmitting}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !messageText.trim()}
              className="inline-flex items-center rounded-lg bg-primarycolor px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-primaryhover disabled:opacity-50 disabled:cursor-not-allowed dark:bg-secondarycolor dark:text-black dark:hover:bg-secondaryhover"
            >
              {isSubmitting ? t("sending") : t("broadcastMessage")}
            </button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default MessagesTable;
