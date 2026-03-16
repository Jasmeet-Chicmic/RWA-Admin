import { getTranslations } from "next-intl/server";

import { getCompaniesAction } from "@/api/companies";
import { AdminCompany } from "@/app/(secured)/companies/helpers/types";
import UserCompaniesTable from "./UserCompaniesTable";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const UserCompaniesPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    searchText?: string;
    skip?: string;
    limit?: string;
  }>;
}) => {
  const { id } = await params;
  const { searchText, skip, limit } = await searchParams;
  const tCompanies = await getTranslations("companies");

  const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
  const skipNum = skip ? Number(skip) : 0;
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getCompaniesAction({
      pageNumber,
      pageSize,
      UserId: id,
      ...(searchText && { searchText }),
    });

    const items: AdminCompany[] = res?.data ?? [];
    const totalCount = res?.total_count ?? items.length;

    return (
      <UserCompaniesTable
        data={items}
        totalCount={totalCount}
        searchText={searchText ?? ""}
      />
    );
  } catch (error) {
    console.error("Error fetching user companies:", error);
    return <ErrorState title={tCompanies("User Companies")} />;
  }
};

export default UserCompaniesPage;
