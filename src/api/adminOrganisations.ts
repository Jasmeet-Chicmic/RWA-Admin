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

export async function getAdminOrganisationsAction() {
  return await getRequest<AdminOrganisation[], undefined>(
    API_END_POINTS.ADMIN_ORGANISATIONS,
  );
}

