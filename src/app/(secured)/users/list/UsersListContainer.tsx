"use client";

import { useDebounce } from "@/hooks/useDebounce";
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
  };
}

const UsersListContainer = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const { items, totalCount } = useAppSelector((state) => state.users.list);

  const combinedDeps = useMemo(
    () => JSON.stringify(buildUsersListDeps(searchParams)),
    [searchParams],
  );
  const debouncedDeps = useDebounce(combinedDeps, 300);

  const payload = useMemo(() => {
    try {
      const parsed = JSON.parse(debouncedDeps) as UsersListDeps;
      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
        kycStatus: 2,
      };
    } catch {
      return null;
    }
  }, [debouncedDeps]);

  useEffect(() => {
    if (!payload) return;
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    dispatch(fetchUsersList(payload));
  }, [debouncedDeps, dispatch, payload]);

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="overflow-x-auto">
        <UserPortfolioTable
          data={items.map((u) => ({
            id: u.id,
            name: u.name ?? "-",
            walletAddress: u.walletAddress,
            properties: u.properties,
            totalInvestment: u.totalInvestment,
            portfolioValue: u.portfolioValue,
            kycStatus: u.kycStatus,
          }))}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
};

export default UsersListContainer;
