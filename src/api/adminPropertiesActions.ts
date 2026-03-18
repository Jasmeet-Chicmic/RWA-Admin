"use server";

import { API_END_POINTS } from "@/shared/api";
import { postRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";

export async function approveAdminPropertyAction(propertyId: string) {
  return await postRequest<ResponseType, undefined>(
    `${API_END_POINTS.ADMIN_PROPERTIES}/${propertyId}/approve`,
    undefined as never,
  );
}

export async function rejectAdminPropertyAction(
  propertyId: string,
  reason: string,
) {
  return await postRequest<ResponseType, { reason: string }>(
    `${API_END_POINTS.ADMIN_PROPERTIES}/${propertyId}/reject`,
    { reason },
  );
}

export async function assignAdminPropertyToOrganisationAction(
  propertyId: string,
  organizationId: string,
) {
  return await postRequest<ResponseType, { organizationId: string }>(
    `${API_END_POINTS.ADMIN_PROPERTIES}/${propertyId}/assign`,
    { organizationId },
  );
}
