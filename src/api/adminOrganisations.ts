"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";

export type AdminOrganisation = {
  id: string;
  name: string;
  entityType: "LLC" | "SPV" | "Trust";
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  propertyHolds: number;
};

export type AdminOrganisationsResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  items: AdminOrganisation[];
};

export type GetAdminOrganisationsParams = {
  page: number;
  pageSize: number;
};

export async function getAdminOrganisationsAction(
  params: GetAdminOrganisationsParams,
) {
  return await getRequest<AdminOrganisationsResponse, GetAdminOrganisationsParams>(
    API_END_POINTS.ADMIN_ORGANISATIONS,
    params,
  );
}

