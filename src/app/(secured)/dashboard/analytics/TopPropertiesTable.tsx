"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { DataTable, DataTableConfig } from "@/components/organisms/DataTable";
import { TableColumn } from "@/components/atoms/Table";
import {
  TEXT_PRIMARY_DARK as TEXT_PRIMARY,
  TEXT_SIZE_SM,
} from "@/shared/styles";
import TruncatedText from "@/components/atoms/TruncatedText/TruncatedText";
import {
  AdminProperty,
  PropertyStatus,
} from "@/app/(secured)/properties/helpers/types";

const MOCK_TOP_PROPERTIES: AdminProperty[] = [
  {
    id: "1",
    name: "Mohali Tower",
    description: "Prime commercial tower in Phase 8B, Mohali",
    location: "Mohali, India",
    propertyType: "Commercial",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 1_000_000_000,
    totalUnits: 100_000,
    availableUnits: 80_000,
    pricePerUnit: 10_000,
    pricePerUnitEth: 4.40819925,
    annualYieldPercent: 10,
    riskScore: 5,
    demandScore: 8.5,
    rentalIncomeHistory: 1_000_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "2",
    name: "Florida Beachfront Villas",
    description: "Luxury beachfront residential villas",
    location: "Miami, Florida",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 25_000_000,
    totalUnits: 25_000,
    availableUnits: 5_000,
    pricePerUnit: 1_000,
    pricePerUnitEth: 0.44,
    annualYieldPercent: 8.5,
    riskScore: 4,
    demandScore: 9.2,
    rentalIncomeHistory: 2_500_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "3",
    name: "London High Street",
    description: "Prime retail units on a busy high street",
    location: "London, United Kingdom",
    propertyType: "Commercial",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 40_000_000,
    totalUnits: 40_000,
    availableUnits: 10_000,
    pricePerUnit: 1_000,
    pricePerUnitEth: 0.44,
    annualYieldPercent: 7.2,
    riskScore: 3,
    demandScore: 9.8,
    rentalIncomeHistory: 3_200_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "4",
    name: "Singapore Tech Park",
    description: "Grade A office space for technology companies",
    location: "Singapore",
    propertyType: "Commercial",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 75_000_000,
    totalUnits: 50_000,
    availableUnits: 15_000,
    pricePerUnit: 1_500,
    pricePerUnitEth: 0.66,
    annualYieldPercent: 9.1,
    riskScore: 4,
    demandScore: 8.9,
    rentalIncomeHistory: 6_800_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "5",
    name: "Toronto Waterfront Residences",
    description: "Modern high-rise with lake views",
    location: "Toronto, Canada",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 30_000_000,
    totalUnits: 20_000,
    availableUnits: 4_000,
    pricePerUnit: 1_500,
    pricePerUnitEth: 0.66,
    annualYieldPercent: 6.8,
    riskScore: 3,
    demandScore: 8.1,
    rentalIncomeHistory: 1_950_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "6",
    name: "Berlin Innovation Campus",
    description: "Mixed-use campus for startups",
    location: "Berlin, Germany",
    propertyType: "Commercial",
    imageUrl: "",
    status: PropertyStatus.PendingApproval,
    rejectionReason: null,
    totalValue: 18_000_000,
    totalUnits: 18_000,
    availableUnits: 18_000,
    pricePerUnit: 1_000,
    pricePerUnitEth: 0.44,
    annualYieldPercent: 7.5,
    riskScore: 6,
    demandScore: 7.4,
    rentalIncomeHistory: 0,
    documents: [],
    hasPendingUpdateRequest: true,
    canEditFullProperty: true,
    canResubmit: false,
    canRequestUpdate: true,
    canDelete: false,
  },
  {
    id: "7",
    name: "Dubai Marina Tower",
    description: "Luxury apartments in Dubai Marina",
    location: "Dubai, UAE",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 55_000_000,
    totalUnits: 30_000,
    availableUnits: 12_000,
    pricePerUnit: 1_833.33,
    pricePerUnitEth: 0.8,
    annualYieldPercent: 9.8,
    riskScore: 6,
    demandScore: 9.1,
    rentalIncomeHistory: 4_900_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "8",
    name: "Sydney Harbour Offices",
    description: "Premium office space with harbour views",
    location: "Sydney, Australia",
    propertyType: "Commercial",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 65_000_000,
    totalUnits: 40_000,
    availableUnits: 16_000,
    pricePerUnit: 1_625,
    pricePerUnitEth: 0.72,
    annualYieldPercent: 8.9,
    riskScore: 5,
    demandScore: 8.7,
    rentalIncomeHistory: 5_300_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "9",
    name: "New York SoHo Lofts",
    description: "Refurbished loft apartments in SoHo",
    location: "New York, USA",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 48_000_000,
    totalUnits: 24_000,
    availableUnits: 6_000,
    pricePerUnit: 2_000,
    pricePerUnitEth: 0.88,
    annualYieldPercent: 7.9,
    riskScore: 4,
    demandScore: 9.4,
    rentalIncomeHistory: 3_800_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
  {
    id: "10",
    name: "Paris Riverside Homes",
    description: "Townhouses along the Seine",
    location: "Paris, France",
    propertyType: "Residential",
    imageUrl: "",
    status: PropertyStatus.Active,
    rejectionReason: null,
    totalValue: 22_000_000,
    totalUnits: 11_000,
    availableUnits: 3_000,
    pricePerUnit: 2_000,
    pricePerUnitEth: 0.88,
    annualYieldPercent: 6.5,
    riskScore: 3,
    demandScore: 8.3,
    rentalIncomeHistory: 1_450_000,
    documents: [],
    hasPendingUpdateRequest: false,
    canEditFullProperty: false,
    canResubmit: false,
    canRequestUpdate: false,
    canDelete: false,
  },
];

const formatCurrencyCompact = (value: number) =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const TopPropertiesTable = () => {
  const t = useTranslations("properties");

  const config: DataTableConfig<AdminProperty> = useMemo(() => {
    const columns: TableColumn<AdminProperty>[] = [
      {
        title: t("Property Name"),
        field: "name",
        render: (item) => (
          <div className="flex flex-col">
            <span className={`font-medium ${TEXT_PRIMARY}`} title={item.name}>
              <TruncatedText text={item.name} maxLength={40} />
            </span>
            <span className={`${TEXT_SIZE_SM} text-textparagraph`}>
              <TruncatedText text={item.location} maxLength={40} />
            </span>
          </div>
        ),
      },
      {
        title: t("Property Type"),
        field: "propertyType",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.propertyType}
          </span>
        ),
      },
      {
        title: t("Total Value"),
        field: "totalValue",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {formatCurrencyCompact(item.totalValue)}
          </span>
        ),
      },
      {
        title: t("Annual Yield"),
        field: "annualYieldPercent",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.annualYieldPercent.toFixed(2)}%
          </span>
        ),
      },
      {
        title: t("Risk Score"),
        field: "riskScore",
        render: (item) => (
          <span className={`${TEXT_SIZE_SM} ${TEXT_PRIMARY}`}>
            {item.riskScore.toFixed(1)}
          </span>
        ),
      },
    ];

    return {
      columns,
      keyExtractor: (item) => item.id,
      paginationTitle: "properties",
      hideSelectCol: true,
      emptyMessage: t("No properties found"),
      queryConfig: {
        defaultSortKey: "totalValue",
      },
    };
  }, [t]);

  return (
    <div className="bg-bgwhite rounded-[20px] border border-bordergray200 p-3 lg:p-6 dark:bg-darkbgprimary dark:border-darkbordercolor1">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            className={`text-[1.125rem] lg:text-[1.25rem] font-bold ${TEXT_PRIMARY}`}
          >
            {t("Top Properties")}
          </h2>
          <p className="text-[13px] font-medium text-textparagraph dark:text-textparagraphlight">
            {t("Top Properties subtitle")}
          </p>
        </div>
      </div>
      <DataTable
        data={MOCK_TOP_PROPERTIES}
        totalCount={MOCK_TOP_PROPERTIES.length}
        config={config}
      />
    </div>
  );
};

export default TopPropertiesTable;
