import ErrorState from "@/components/atoms/ErrorState";
import { AdminProperty, PropertyStatus } from "../../helpers/types";
import OrganisationPropertiesTable from "./OrganisationPropertiesTable";

const mockOrganisationProperties: AdminProperty[] = [
  {
    id: "prop-1",
    name: "Maple Grove Residences",
    description: "",
    location: "Austin, Texas, USA",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 12500000,
    totalUnits: 2500,
    availableUnits: 820,
    pricePerUnit: 5000,
    pricePerUnitEth: 0,
    annualYieldPercent: 7.25,
    riskScore: 3,
    demandScore: null,
    rentalIncomeHistory: 0,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "prop-2",
    name: "Sunset Villas",
    description: "",
    location: "Miami, Florida, USA",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 9800000,
    totalUnits: 1800,
    availableUnits: 410,
    pricePerUnit: 5444.44,
    pricePerUnitEth: 0,
    annualYieldPercent: 6.4,
    riskScore: 4,
    demandScore: null,
    rentalIncomeHistory: 0,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
];

const DEFAULT_PAGE_SIZE = 10;

const OrganisationPropertiesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: number;
    limit?: number;
  }>;
}) => {
  try {
    // Future: use organisationId + pagination params to fetch from API
    const { skip, limit } = await searchParams;
    const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
    const skipNum = skip ? Number(skip) : 0;
    const pageNumber = Math.floor(skipNum / pageSize) + 1;
    void pageNumber;

    const items = mockOrganisationProperties;
    const totalCount = mockOrganisationProperties.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <OrganisationPropertiesTable data={items} totalCount={totalCount} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching organisation properties:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationPropertiesPage;
