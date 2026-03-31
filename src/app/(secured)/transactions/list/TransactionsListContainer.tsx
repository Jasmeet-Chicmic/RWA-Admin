"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTransactionsList } from "@/store/transactionsSlice";
import TransactionsTable from "./TransactionsTable";

const DEFAULT_PAGE_SIZE = 10;

type TransactionsDeps = {
  skip: number;
  limitRaw: string | null;
  pageSize: number;
  page: number;
  status: string | null;
  fromDate: string | null;
  toDate: string | null;
};

function buildTransactionsDeps(
  searchParams: ReturnType<typeof useSearchParams>,
): TransactionsDeps {
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
    status: params.get("status"),
    fromDate: params.get("fromDate"),
    toDate: params.get("toDate"),
  };
}

const TransactionsListContainer = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const { items, totalCount, isLoading } = useAppSelector(
    (state) => state.transactions.list,
  );

  const combinedDeps = useMemo(
    () => JSON.stringify(buildTransactionsDeps(searchParams)),
    [searchParams],
  );
  const debouncedDeps = useDebounce(combinedDeps, 300);

  const payload = useMemo(() => {
    try {
      const parsed = JSON.parse(debouncedDeps) as TransactionsDeps;
      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
        ...(parsed.status ? { status: Number(parsed.status) } : {}),
        ...(parsed.fromDate ? { fromDate: parsed.fromDate } : {}),
        ...(parsed.toDate ? { toDate: parsed.toDate } : {}),
      };
    } catch {
      return null;
    }
  }, [debouncedDeps]);

  useEffect(() => {
    if (!payload) return;
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    dispatch(fetchTransactionsList(payload));
  }, [debouncedDeps, dispatch, payload]);

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <TransactionsTable
        data={items}
        totalCount={totalCount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default TransactionsListContainer;
