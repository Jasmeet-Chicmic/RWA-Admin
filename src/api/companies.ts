"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, putRequest } from "@/shared/fetcher";
import {
  CompaniesListResponse,
  GetCompaniesParams,
  CompanyDetailResponse,
} from "@/app/(secured)/companies/helpers/types";

export async function getCompaniesAction(params: GetCompaniesParams) {
  return await getRequest<CompaniesListResponse, GetCompaniesParams>(
    API_END_POINTS.USER_COMPANIES,
    params,
  );
}

export async function deleteCompanyAction(body: { companyIds: string[] }) {
  const { deleteRequest } = await import("@/shared/fetcher");
  return await deleteRequest(API_END_POINTS.COMPANY, body);
}

export async function getCompanyByIdAction(companyId: string) {
  return await getRequest<CompanyDetailResponse, never>(
    `${API_END_POINTS.COMPANY}/${companyId}`,
    undefined as never,
  );
}

export async function updateCompanyVerificationAction(params: {
  companyId: string;
  isVerified: boolean;
}) {
  const { companyId, isVerified } = params;
  return await putRequest<
    { result: string },
    {
      isVerified: boolean;
    }
  >(`${API_END_POINTS.COMPANY_VERIFICATION}/${companyId}/verification`, {
    isVerified,
  });
}

export async function updateCompanyAccessAction(params: {
  companyId: string;
  isSuspended?: boolean;
  isActive?: boolean;
}) {
  const { companyId, isSuspended, isActive } = params;
  return await putRequest<
    { result: string },
    {
      isSuspended?: boolean;
      isActive?: boolean;
    }
  >(`${API_END_POINTS.COMPANY_ACCESS}/${companyId}/access`, {
    ...(typeof isSuspended === "boolean" && { isSuspended }),
    ...(typeof isActive === "boolean" && { isActive }),
  });
}
