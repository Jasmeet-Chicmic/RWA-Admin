"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";

export type OrganisationProfile = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  entityType: string;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
};

type OrganisationProfileResponse = ResponseType & {
  data?: OrganisationProfile;
};

import {
  AllPropertiesResponse,
  GetAllPropertiesParams,
  BaseResponse,
} from "@/app/(secured)/properties/helpers/allPropertiesTypes";

export async function getOrganisationProfileAction() {
  return await getRequest<OrganisationProfileResponse, undefined>(
    API_END_POINTS.ORGANIZATION_PROFILE,
  );
}

export async function getAuthOrganisationPropertiesAction(
  params: GetAllPropertiesParams,
) {
  return await getRequest<
    BaseResponse<AllPropertiesResponse>,
    GetAllPropertiesParams,
    AllPropertiesResponse
  >(API_END_POINTS.ORGANIZATION_PROPERTIES, params, {
    transformer: (res) => res.data as AllPropertiesResponse,
  });
}
