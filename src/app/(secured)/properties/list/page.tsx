import { getAdminPropertiesAction } from "@/api/adminProperties";
import ErrorState from "@/components/atoms/ErrorState";

import { AdminProperty, PropertyStatus } from "../helpers/types";
import PropertiesTable from "./PropertiesTable";

const DEFAULT_PAGE_SIZE = 10;

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: number;
    limit?: number;
  }>;
}) => {
  const { skip, limit } = await searchParams;

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const page = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getAdminPropertiesAction({
      page,
      pageSize,
      status: PropertyStatus.PendingApproval,
    });

    const items: AdminProperty[] = res?.items ?? [];
    const totalCount = res?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <PropertiesTable data={items} totalCount={totalCount} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching properties:", error);
    return <ErrorState title="properties" />;
  }
};

export default Page;
