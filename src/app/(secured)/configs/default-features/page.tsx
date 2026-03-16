import { getDefaultFeaturesAction } from "@/api/features";
import DefaultFeaturesTable from "../list/DefaultFeaturesTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const DefaultFeaturesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: number;
    limit?: number;
    searchText?: string;
  }>;
}) => {
  const { skip, limit, searchText } = await searchParams;

  const skipValue = skip ? Number(skip) : 0;
  const limitValue = limit ? Number(limit) : DEFAULT_PAGE_SIZE;

  try {
    const res = await getDefaultFeaturesAction(
      skipValue,
      limitValue,
      searchText ?? "",
    );

    const items = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <DefaultFeaturesTable data={items} totalCount={totalCount} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching features:", error);
    return <ErrorState title="features" />;
  }
};

export default DefaultFeaturesPage;
