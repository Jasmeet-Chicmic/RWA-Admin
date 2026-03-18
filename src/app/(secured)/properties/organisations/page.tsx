import ErrorState from "@/components/atoms/ErrorState";
import OrganisationsTable, { OrganisationRow } from "./OrganisationsTable";
import { getAdminOrganisationsAction } from "@/api/adminOrganisations";

const OrganisationsPage = async () => {
  try {
    const res = (await getAdminOrganisationsAction()) ?? [];

    const organisations: OrganisationRow[] = res.map((org) => ({
      id: org.id,
      name: org.name,
      entityType: org.entityType,
      registrationNumber: org.registrationNumber,
      jurisdiction: org.jurisdiction,
      incorporationDate: org.incorporationDate,
      propertyHolds: org.propertyHolds,
    }));

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <OrganisationsTable
            data={organisations}
            totalCount={organisations.length}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading organisations:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationsPage;
