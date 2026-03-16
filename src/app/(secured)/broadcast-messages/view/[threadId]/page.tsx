import { getMessagesAction, getBroadcastChannelsAction } from "@/api/broadcast";
import MessagesTable from "./MessagesTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PRIVATE_ROUTES } from "@/shared/routes";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 20;

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{
    skip?: string;
    limit?: string;
    searchText?: string;
  }>;
}) => {
  const { threadId } = await params;
  const { skip, limit, searchText } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;

  try {
    // Fetch channel info
    const channelsRes = await getBroadcastChannelsAction({
      limit: 1000,
    });
    const channel = channelsRes?.data?.items?.find(
      (ch) => ch.threadId === threadId,
    );

    // Fetch messages
    const messagesRes = await getMessagesAction({
      threadId,
      skip: skipNum,
      limit: pageSize,
      ...(searchText && { searchText }),
    });

    const messages = messagesRes?.data?.items ?? [];
    const totalCount = messagesRes?.data?.totalCount ?? 0;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="bg-bgwhite dark:bg-darkbgprimary px-[15px] lg:px-5 3xl:px-6 pt-[15px] lg:pt-5 3xl:pt-7 pb-3 rounded-[20px_20px_0_0] border-b border-bordercolor1 dark:border-darkbordercolor1">
          <Link
            href={PRIVATE_ROUTES.BROADCAST_MESSAGES_LIST}
            className="inline-flex items-center gap-2 text-sm font-medium text-textparagraph dark:text-textparagraphlight hover:text-primarycolor dark:hover:text-secondarycolor transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Channels</span>
          </Link>
          {channel && (
            <div className="mt-2">
              <h2 className="text-lg font-semibold text-textprimary dark:text-sidebartext">
                {channel.title}
              </h2>
            </div>
          )}
        </div>
        <div className="px-[15px] lg:px-5 3xl:px-6 pb-5 rounded-b-[20px] bg-bgwhite dark:bg-darkbgprimary border-b border-bordercolor1 dark:border-darkbordercolor1">
          <MessagesTable
            messages={messages}
            totalCount={totalCount}
            threadId={threadId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return <ErrorState title="messages" />;
  }
};

export default Page;
