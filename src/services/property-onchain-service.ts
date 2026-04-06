import { getRequest, postRequest } from "@/services/fetcher";
import { INTERNAL_API_PATHS } from "@/shared/api";

type ApiResponse<TData> = {
  statusCode?: number;
  status?: boolean;
  message?: string;
  data?: TData;
};

const safeJson = (value: unknown) => {
  try {
    return JSON.stringify(
      value,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    );
  } catch {
    return "[unserializable]";
  }
};

const logApiRequest = (endpoint: string, payload: unknown) => {
  console.log(
    `[PropertyOnchain API] request ${endpoint}: ${safeJson(payload)}`,
  );
};

const logApiResponse = (endpoint: string, response: unknown) => {
  console.log(
    `[PropertyOnchain API] response ${endpoint}: ${safeJson(response)}`,
  );
};

const postWithLogs = async <TResponse, TPayload>(
  endpoint: string,
  payload: TPayload,
) => {
  logApiRequest(endpoint, payload);
  const response = await postRequest<TResponse, TPayload>(endpoint, payload);
  logApiResponse(endpoint, response);
  return response;
};

const getWithLogs = async <TResponse, TParams extends object>(
  endpoint: string,
  params: TParams,
) => {
  logApiRequest(endpoint, params);
  const response = await getRequest<TResponse, TParams>(endpoint, params);
  logApiResponse(endpoint, response);
  return response;
};

export type InitiatePropertyOnchainPayload = {
  propertyId: string;
  mintAmount: number;
  pricePerShare: number;
  /** 1–10; omit when not set so older APIs receive the original shape only. */
  riskScore?: number;
};

export const propertyOnchainService = {
  async initiate(payload: InitiatePropertyOnchainPayload) {
    return await postWithLogs<
      ApiResponse<{ jobId: string }>,
      InitiatePropertyOnchainPayload
    >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_INITIATE, payload);
  },

  async trexDeployed(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_TREX_DEPLOYED,
      payload,
    );
  },

  async vaultDeployed(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_VAULT_DEPLOYED,
      payload,
    );
  },

  async propertyRegistered(payload: {
    propertyId: string;
    txHash: `0x${string}`;
  }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_PROPERTY_REGISTERED,
      payload,
    );
  },

  async kycDone(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_KYC_DONE,
      payload,
    );
  },

  async unpauseDone(payload: { propertyId: string; txHash: `0x${string}` }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_UNPAUSE_DONE,
      payload,
    );
  },

  async minted(payload: {
    propertyId: string;
    txHash: `0x${string}`;
    shares?: string;
  }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_MINTED,
      payload,
    );
  },

  async complianceBound(payload: {
    propertyId: string;
    txHash: `0x${string}`;
  }) {
    return await postWithLogs<ApiResponse<unknown>, typeof payload>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_COMPLIANCE_BOUND,
      payload,
    );
  },

  async status(params: { propertyId: string }) {
    return await getWithLogs<ApiResponse<unknown>, typeof params>(
      INTERNAL_API_PATHS.PROPERTY_ONCHAIN_STATUS,
      params,
    );
  },
};
