"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rentalIncomeService } from "@/services/rental-income-service";
import { RentalIncomeListItem } from "@/types/rental-income";
import RentManagementTable from "./RentManagementTable";

const DEFAULT_PAGE_SIZE = 10;

type RentManagementDeps = {
  skip: number;
  pageSize: number;
  page: number;
  status: number | null;
  propertyId: string | null;
};

function buildRentManagementDeps(
  searchParams: ReturnType<typeof useSearchParams>,
): RentManagementDeps {
  const params = new URLSearchParams(searchParams.toString());
  const limitRaw = params.get("limit");
  const skipRaw = params.get("skip");
  const statusRaw = params.get("status");
  const propertyIdRaw = params.get("searchText");

  const pageSize = limitRaw ? Number(limitRaw) : DEFAULT_PAGE_SIZE;
  const skip = skipRaw ? Number(skipRaw) : 0;
  const page = Math.floor(skip / pageSize) + 1;
  const status = statusRaw ? Number(statusRaw) : null;
  const propertyId = propertyIdRaw?.trim() ? propertyIdRaw.trim() : null;

  return {
    skip,
    pageSize,
    page,
    status: Number.isFinite(status) ? status : null,
    propertyId,
  };
}

const RentManagementContainer = () => {
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const [items, setItems] = useState<RentalIncomeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const combinedDeps = useMemo(
    () => JSON.stringify(buildRentManagementDeps(searchParams)),
    [searchParams],
  );

  const requestPayload = useMemo(() => {
    try {
      const parsed = JSON.parse(combinedDeps) as RentManagementDeps;
      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
        ...(typeof parsed.status === "number" ? { status: parsed.status } : {}),
        ...(parsed.propertyId ? { propertyId: parsed.propertyId } : {}),
      };
    } catch {
      return null;
    }
  }, [combinedDeps]);

  const fetchRentalIncomes = useCallback(
    (payload: NonNullable<typeof requestPayload>, requestKey: string) => {
      const requestId = ++requestIdRef.current;
      lastRequestKeyRef.current = requestKey;
      setIsLoading(true);

      rentalIncomeService
        .getRentalIncomes(payload)
        .then((response) => {
          if (requestId !== requestIdRef.current) return;
          // Support both shapes: { data: { items, total } } and nested fallbacks.
          const apiPayload = response.data as
            | {
                items?: RentalIncomeListItem[];
                total?: number;
                data?: { items?: RentalIncomeListItem[]; total?: number };
              }
            | undefined;
          const resolvedItems = Array.isArray(apiPayload?.items)
            ? apiPayload.items
            : Array.isArray(apiPayload?.data?.items)
              ? apiPayload.data.items
              : [];
          const resolvedTotal =
            typeof apiPayload?.total === "number"
              ? apiPayload.total
              : typeof apiPayload?.data?.total === "number"
                ? apiPayload.data.total
                : resolvedItems.length;

          setItems(resolvedItems);
          setTotalCount(resolvedTotal);
        })
        .catch((error) => {
          if (requestId !== requestIdRef.current) return;
          console.error(
            "[RentManagement] Failed to fetch rental incomes:",
            error,
          );
          setItems([]);
          setTotalCount(0);
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setIsLoading(false);
        });
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    if (!requestPayload) return;
    fetchRentalIncomes(
      requestPayload,
      `${combinedDeps}::refresh:${Date.now()}`,
    );
  }, [combinedDeps, fetchRentalIncomes, requestPayload]);

  useEffect(() => {
    if (!requestPayload) return;
    if (lastRequestKeyRef.current === combinedDeps) return;
    fetchRentalIncomes(requestPayload, combinedDeps);
  }, [combinedDeps, fetchRentalIncomes, requestPayload]);

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <RentManagementTable
        data={items}
        totalCount={totalCount}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default RentManagementContainer;
