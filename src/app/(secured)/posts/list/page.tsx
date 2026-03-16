import { getAdminPostsAction } from "@/api/adminPosts";
import { AdminPost } from "../helpers/types";
import PostsTable from "./PostsTable";
import ErrorState from "@/components/atoms/ErrorState";
import { SORT_DIRECTION } from "@/shared/types";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    searchText?: string;
    skip?: number;
    limit?: number;
    sortKey?: string;
    sortDirection?: string;
    sponsorStatus?: string;
    hasAds?: string;
    reviewFlagged?: string;
    sponsorAssignment?: string;
    featureContent?: string;
  }>;
}) => {
  const {
    searchText,
    skip,
    limit,
    sortKey,
    sortDirection,
    sponsorStatus,
    hasAds,
    reviewFlagged,
    sponsorAssignment,
    featureContent,
  } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;

  try {
    const res = await getAdminPostsAction({
      skip: skipNum,
      limit: pageSize,
      ...(searchText && { searchString: searchText }),
      ...(sortKey &&
        sortDirection && {
          sortBy: sortKey,
          //need to change one backend dev changed it
          sortDirection: sortDirection as SORT_DIRECTION,
        }),
      ...(sponsorStatus !== undefined && {
        sponsorStatus: sponsorStatus === "true",
      }),
      ...(hasAds !== undefined && { hasAds: hasAds === "true" }),
      ...(reviewFlagged !== undefined && {
        reviewFlagged: reviewFlagged === "true",
      }),
      ...(sponsorAssignment !== undefined && {
        sponsorAssignment: sponsorAssignment === "true",
      }),
      ...(featureContent !== undefined && {
        featureContent: featureContent === "true",
      }),
    });

    const items: AdminPost[] = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <PostsTable
          data={items}
          totalCount={totalCount}
          searchText={searchText ?? ""}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return <ErrorState title="posts" />;
  }
};

export default Page;
