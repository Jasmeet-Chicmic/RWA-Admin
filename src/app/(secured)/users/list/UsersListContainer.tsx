"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsersList } from "@/store/usersSlice";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import UserPortfolioTable from "./UserPortfolioTable";

const DEFAULT_PAGE_SIZE = 10;

type UsersListDeps = {
  skip: number;
  limitRaw: string | null;
  pageSize: number;
  page: number;
  search: string | null;
  kycStatus: string | null;
};

function buildUsersListDeps(
  searchParams: ReturnType<typeof useSearchParams>,
): UsersListDeps {
  const params = new URLSearchParams(searchParams.toString());
  const skipRaw = params.get("skip");
  const limitRaw = params.get("limit");
  const pageSize = limitRaw ? Number(limitRaw) : DEFAULT_PAGE_SIZE;
  const skip = skipRaw ? Number(skipRaw) : 0;
  const page = Math.floor(skip / pageSize) + 1;

  return {
    skip,
    limitRaw,
    pageSize,
    page,
    search: params.get("search"),
    kycStatus: params.get("kycStatus"),
  };
}

const UsersListContainer = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const { items, totalCount, isLoading } = useAppSelector(
    (state) => state.users.list,
  );

  const combinedDeps = useMemo(
    () => JSON.stringify(buildUsersListDeps(searchParams)),
    [searchParams],
  );

  const payload = useMemo(() => {
    try {
      const parsed = JSON.parse(combinedDeps) as UsersListDeps;
      const trimmedSearch = parsed.search?.trim() ?? "";
      const kycRaw = parsed.kycStatus;
      const kycNum = kycRaw !== null && kycRaw !== "" ? Number(kycRaw) : NaN;
      const kycValid =
        Number.isInteger(kycNum) && kycNum >= 0 && kycNum <= 3 ? kycNum : null;

      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
        ...(trimmedSearch ? { search: trimmedSearch } : {}),
        ...(kycValid !== null ? { kycStatus: kycValid } : {}),
      };
    } catch {
      return null;
    }
  }, [combinedDeps]);

  useEffect(() => {
    if (!payload) return;
    if (lastRequestKeyRef.current === combinedDeps) return;
    lastRequestKeyRef.current = combinedDeps;
    dispatch(fetchUsersList(payload));
  }, [combinedDeps, dispatch, payload]);

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="overflow-x-auto">
        <UserPortfolioTable
          data={items.map((u) => ({
            id: u.id,
            name: u.name ?? "-",
            walletAddress: u.walletAddress,
            identityContractAddress: u.identityContractAddress,
            propertiesOwned: u.propertiesOwned,
            propertiesRegistered: u.propertiesRegistered,
            totalInvestment: u.totalInvestment,
            portfolioValue: u.portfolioValue,
            kycStatus: u.kycStatus,
          }))}
          totalCount={totalCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default UsersListContainer;
