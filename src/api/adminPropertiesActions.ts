"use server";

import { API_END_POINTS } from "@/shared/api";
import { postRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";

interface PropertyActionPayload {
  reason?: string;
  documents?: Array<{
    title: string;
    fileName: string;
    documentUrl: string;
  }>;
}

type BatchUploadResponse = ResponseType & {
  data?:
    | { urls?: string[]; filePaths?: string[] }
    | Array<{ url?: string; filePath?: string }>;
};

export async function approveAdminPropertyAction(
  propertyId: string,
  payload?: PropertyActionPayload,
) {
  return await postRequest<ResponseType, PropertyActionPayload | undefined>(
    `${API_END_POINTS.ADMIN_PROPERTIES}/${propertyId}/approve`,
    payload as PropertyActionPayload,
  );
}

export async function rejectAdminPropertyAction(
  propertyId: string,
  reason: string,
  documents: NonNullable<PropertyActionPayload["documents"]> = [],
) {
  const payload: PropertyActionPayload = {
    reason,
    documents,
  };

  return await postRequest<ResponseType, PropertyActionPayload>(
    `${API_END_POINTS.ADMIN_PROPERTIES}/${propertyId}/reject`,
    payload,
  );
}

export async function uploadAdminPropertyDocumentsAction(formData: FormData) {
  return await postRequest<BatchUploadResponse, FormData>(
    `${API_END_POINTS.BATCH_UPLOAD}?type=document`,
    formData,
    {
      headers: {
        Accept: "*/*",
        "Content-Type": undefined as unknown as string,
      },
    },
  );
}

export async function assignAdminPropertyToOrganisationAction(
  propertyId: string,
  organizationId: string,
) {
  console.log(
    "Assign Admin Property to Organisation Request::",
    propertyId,
    organizationId,
  );
  const response = await postRequest<ResponseType, { organizationId: string }>(
    `${API_END_POINTS.ADMIN_PROPERTIES}/${propertyId}/assign`,
    { organizationId },
  );
  console.log("Assign Admin Property to Organisation Response::", response);
  return response;
}
