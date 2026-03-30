"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPropertyOrganisations } from "@/store/propertiesSlice";
import PropertyOrganisationsTable from "./PropertyOrganisationsTable";

const DEFAULT_PAGE_SIZE = 10;

/** Every search-param value that can affect the property-organisations list request. */
type PropertyOrganisationsListDeps = {
  skip: number;
  limitRaw: string | null;
  pageSize: number;
  page: number;
  sortKey: string;
  sortDirection: string;
  search: string;
};

function buildListDepsFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): PropertyOrganisationsListDeps {
  const params = new URLSearchParams(searchParams.toString());
  const skipRaw = params.get("skip");
  const limitRaw = params.get("limit");
  const sortKey = params.get("sortKey") ?? "";
  const sortDirection = params.get("sortDirection") ?? "";
  const search = params.get("search") ?? "";

  const pageSize = limitRaw ? Number(limitRaw) : DEFAULT_PAGE_SIZE;
  const skip = skipRaw ? Number(skipRaw) : 0;
  const page = Math.floor(skip / pageSize) + 1;

  return {
    skip,
    limitRaw,
    pageSize,
    page,
    sortKey,
    sortDirection,
    search,
  };
}

const PropertyOrganisationsContainer = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const { items, totalCount } = useAppSelector(
    (state) => state.properties.propertyOrganisations,
  );

  const combinedDeps = useMemo(
    () => JSON.stringify(buildListDepsFromSearchParams(searchParams)),
    [searchParams],
  );

  const debouncedDeps = useDebounce(combinedDeps, 300);

  const payload = useMemo((): { page: number; pageSize: number } | null => {
    try {
      const parsed = JSON.parse(debouncedDeps) as PropertyOrganisationsListDeps;
      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
      };
    } catch {
      return null;
    }
  }, [debouncedDeps]);

  useEffect(() => {
    if (!payload) return;
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    dispatch(fetchPropertyOrganisations(payload));
  }, [debouncedDeps, dispatch, payload]);

  return <PropertyOrganisationsTable data={items} totalCount={totalCount} />;
};

export default PropertyOrganisationsContainer;
