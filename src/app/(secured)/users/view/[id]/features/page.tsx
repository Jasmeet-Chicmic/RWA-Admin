import { getUserFeaturesAction } from "@/api/user";
import UserFeaturesView from "./UserFeaturesTable";

const FeaturesPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    skip?: string;
    limit?: string;
    searchText?: string;
  }>;
}) => {
  const { id } = await params;
  const { skip, limit, searchText } = await searchParams;

  const skipValue = skip ? Number(skip) : 0;
  const limitValue = limit ? Number(limit) : 10;

  try {
    const res = await getUserFeaturesAction(
      id,
      skipValue,
      limitValue,
      searchText ?? "",
    );

    const features = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? features.length;

    return (
      <UserFeaturesView
        features={features}
        userId={id}
        totalCount={totalCount}
      />
    );
  } catch (error: unknown) {
    console.error("Error fetching features:", error);
    throw error;
  }
};

export default FeaturesPage;
