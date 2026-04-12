"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { LOGIN_ROLE } from "@/shared/constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminOrganisations,
  fetchOrganisationProfile,
  fetchSessionRole,
} from "@/store/organisationsSlice";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import OrganisationPropertiesTable from "../properties/organisations/[organisationId]/OrganisationPropertiesTable";
import OrganisationsTable, { OrganisationRow } from "./OrganisationsTable";

const DEFAULT_PAGE_SIZE = 10;

type OrganisationsListDeps = {
  skip: number;
  limitRaw: string | null;
  pageSize: number;
  page: number;
};

function buildOrganisationsListDeps(
  searchParams: ReturnType<typeof useSearchParams>,
): OrganisationsListDeps {
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

const OrganisationsContainer = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);
  const didLoadSessionRef = useRef(false);
  const { role, profile, list, sessionLoading } = useAppSelector(
    (state) => state.organisations,
  );

  const combinedDeps = useMemo(
    () => JSON.stringify(buildOrganisationsListDeps(searchParams)),
    [searchParams],
  );

  const debouncedDeps = useDebounce(combinedDeps, 300);

  const listPayload = useMemo(() => {
    try {
      const parsed = JSON.parse(debouncedDeps) as OrganisationsListDeps;
      return {
        page: parsed.page,
        pageSize: parsed.pageSize,
      };
    } catch {
      return null;
    }
  }, [debouncedDeps]);

  useEffect(() => {
    if (didLoadSessionRef.current) return;
    didLoadSessionRef.current = true;
    dispatch(fetchSessionRole());
  }, [dispatch]);

  useEffect(() => {
    if (role === LOGIN_ROLE.ORGANISATION && !profile?.id) {
      dispatch(fetchOrganisationProfile());
    }
  }, [dispatch, profile?.id, role]);

  useEffect(() => {
    if (role !== LOGIN_ROLE.ADMIN) return;
    if (!listPayload) return;
    if (lastRequestKeyRef.current === debouncedDeps) return;
    lastRequestKeyRef.current = debouncedDeps;
    dispatch(fetchAdminOrganisations(listPayload));
  }, [debouncedDeps, dispatch, listPayload, role]);

  if (role === LOGIN_ROLE.ORGANISATION) {
    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
        <div className="overflow-x-auto">
          <OrganisationPropertiesTable organisationId={profile?.id ?? ""} />
        </div>
      </div>
    );
  }

  const organisations: OrganisationRow[] = list.items.map((org) => ({
    id: org.id,
    name: org.name,
    walletAddress: org.walletAddress,
    entityType: org.entityType,
    registrationNumber: org.registrationNumber,
    jurisdiction: org.jurisdiction,
    incorporationDate: org.incorporationDate,
    status: org.status,
    propertyHolds: org.propertyHolds,
  }));

  const isOrganisationsTableLoading =
    sessionLoading ||
    role === null ||
    (role === LOGIN_ROLE.ADMIN &&
      (list.isLoading || !list.hasInitiallyFetched));

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
      <div className="overflow-x-auto">
        <OrganisationsTable
          data={organisations}
          totalCount={list.totalCount}
          isLoading={isOrganisationsTableLoading}
          onRefresh={() => {
            lastRequestKeyRef.current = null;
            const deps = buildOrganisationsListDeps(searchParams);
            dispatch(
              fetchAdminOrganisations({
                page: deps.page,
                pageSize: deps.pageSize,
              }),
            );
          }}
        />
      </div>
    </div>
  );
};

export default OrganisationsContainer;
