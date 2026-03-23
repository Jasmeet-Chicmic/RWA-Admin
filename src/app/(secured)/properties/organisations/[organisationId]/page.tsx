import ErrorState from "@/components/atoms/ErrorState";
import OrganisationPropertiesTable from "./OrganisationPropertiesTable";
import { getOrganisationPropertiesAction } from "@/api/adminOrganisations";

const DEFAULT_PAGE_SIZE = 10;

const OrganisationPropertiesPage = async ({
  params,
  searchParams,
}: {
  params: { organisationId: string };
  searchParams: Promise<{
    skip?: number;
    limit?: number;
  }>;
}) => {
  try {
    const { skip, limit } = await searchParams;
    const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
    const skipNum = skip ? Number(skip) : 0;
    const pageNumber = Math.floor(skipNum / pageSize) + 1;
    const { organisationId } = await params;
    const res = await getOrganisationPropertiesAction({
      organisationId: organisationId,
      page: pageNumber,
      pageSize,
    });

    const items = res?.items ?? [];
    const totalCount = res?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <OrganisationPropertiesTable
            data={items}
            totalCount={totalCount}
            organisationId={params.organisationId}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching organisation properties:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationPropertiesPage;
