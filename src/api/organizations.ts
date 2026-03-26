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

export async function getOrganisationProfileAction() {
  return await getRequest<OrganisationProfileResponse, undefined>(
    API_END_POINTS.ORGANIZATION_PROFILE,
  );
}
