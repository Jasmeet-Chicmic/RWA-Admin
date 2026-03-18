import ErrorState from "@/components/atoms/ErrorState";
import OrganisationsTable, { OrganisationRow } from "./OrganisationsTable";

const mockOrganisations: OrganisationRow[] = [
  {
    id: "llc-1",
    name: "Maple Grove Property LLC",
    entityType: "LLC",
    registrationNumber: "DE-908173",
    jurisdiction: "Delaware, USA",
    incorporationDate: "2024-02-15",
    propertyholds: 6,
  },
  {
    id: "llc-2",
    name: "Sunset Villas Holdings LLC",
    entityType: "LLC",
    registrationNumber: "TX-441902",
    jurisdiction: "Texas, USA",
    incorporationDate: "2023-08-04",
    propertyholds: 4,
  },
  {
    id: "llc-3",
    name: "Downtown Heights SPV LLC",
    entityType: "SPV",
    registrationNumber: "NY-120773",
    jurisdiction: "New York, USA",
    incorporationDate: "2025-01-10",
    propertyholds: 2,
  },
  {
    id: "llc-4",
    name: "Greenfield Residential LLC",
    entityType: "LLC",
    registrationNumber: "CA-770154",
    jurisdiction: "California, USA",
    incorporationDate: "2022-11-21",
    propertyholds: 8,
  },
  {
    id: "llc-5",
    name: "Riverside Apartments Owner LLC",
    entityType: "Trust",
    registrationNumber: "FL-330812",
    jurisdiction: "Florida, USA",
    incorporationDate: "2021-06-30",
    propertyholds: 3,
  },
];

const OrganisationsPage = async () => {
  try {
    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <OrganisationsTable
            data={mockOrganisations}
            totalCount={mockOrganisations.length}
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
