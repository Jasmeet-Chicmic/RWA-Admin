import UserPortfolioTable from "./UserPortfolioTable";
import { getUsersAction } from "@/api/user";
import ErrorState from "@/components/atoms/ErrorState";

const DEFAULT_PAGE_SIZE = 10;

const UserManagment = async ({
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
  const pageNumber = Math.floor(skipNum / pageSize) + 1;

  try {
    const res = await getUsersAction({
      pageNumber,
      pageSize,
      KycStatus: 2,
    });

    const payload = (res?.data as
      | {
          page: number;
          pageSize: number;
          totalCount: number;
          totalPages: number;
          items: {
            id: string;
            name: string | null;
            walletAddress: string;
            properties: number;
            totalInvestment: number;
            portfolioValue: number;
            kycStatus: 0 | 1 | 2 | 3;
          }[];
        }
      | undefined) ?? {
      page: 1,
      pageSize,
      totalCount: 0,
      totalPages: 0,
      items: [],
    };

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <UserPortfolioTable
            data={payload.items.map((u) => ({
              id: u.id,
              name: u.name ?? "-",
              walletAddress: u.walletAddress,
              properties: u.properties,
              totalInvestment: u.totalInvestment,
              portfolioValue: u.portfolioValue,
              kycStatus: u.kycStatus,
            }))}
            totalCount={payload.totalCount}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return <ErrorState title="users" />;
  }
};

export default UserManagment;
