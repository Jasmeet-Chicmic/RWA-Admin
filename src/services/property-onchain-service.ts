import { getRequest, postRequest } from "@/services/fetcher";
import { INTERNAL_API_PATHS } from "@/shared/api";

type ApiResponse<TData> = {
  statusCode?: number;
  status?: boolean;
  message?: string;
  data?: TData;
};

export type InitiatePropertyOnchainPayload = {
  propertyId: string;
  mintAmount: number;
  pricePerShare: number;
};

export const propertyOnchainService = {
  async initiate(payload: InitiatePropertyOnchainPayload) {
    return await postRequest<
      ApiResponse<{ jobId: string }>,
      InitiatePropertyOnchainPayload
    >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_INITIATE, payload);
  },

  async trexDeployed(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_TREX_DEPLOYED,
      payload,
    );
  },

  async vaultDeployed(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_VAULT_DEPLOYED,
      payload,
    );
  },

  async propertyRegistered(payload: {
    propertyId: string;
    txHash: `0x${string}`;
  }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_PROPERTY_REGISTERED,
      payload,
    );
  },

  async kycDone(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_KYC_DONE,
      payload,
    );
  },

  async unpauseDone(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_UNPAUSE_DONE,
      payload,
    );
  },

  async minted(payload: {
    propertyId: string;
    txHash: `0x${string}`;
    shares?: string;
  }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_MINTED,
      payload,
    );
  },

  async complianceBound(payload: {
    propertyId: string;
    txHash: `0x${string}`;
  }) {
    return await postRequest<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_COMPLIANCE_BOUND,
      payload,
    );
  },

  async status(params: { propertyId: string }) {
    return await getRequest<ApiResponse<unknown>, typeof params>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_STATUS,
      params,
    );
  },
};
