import ErrorState from "@/components/atoms/ErrorState";
import OrganisationsTable, { OrganisationRow } from "./OrganisationsTable";
import {
  getAdminOrganisationsAction,
  AdminOrganisation,
} from "@/api/adminOrganisations";

const DEFAULT_PAGE_SIZE = 10;

const OrganisationsPage = async ({
  searchParams,
}: {
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

    const res = await getAdminOrganisationsAction({
      page: pageNumber,
      pageSize,
    });

    const items = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? items.length;

    const organisations: OrganisationRow[] = items.map(
      (org: AdminOrganisation) => ({
        id: org.id,
        name: org.name,
        walletAddress: org.walletAddress,
        entityType: org.entityType,
        registrationNumber: org.registrationNumber,
        jurisdiction: org.jurisdiction,
        incorporationDate: org.incorporationDate,
        status: org.status,
        propertyHolds: org.propertyHolds,
      }),
    );

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
        <div className="overflow-x-auto">
          <OrganisationsTable data={organisations} totalCount={totalCount} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading organisations:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationsPage;
