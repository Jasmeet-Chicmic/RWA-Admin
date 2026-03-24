import { INTERNAL_API_PATHS } from "@/shared/api";
import { requestApiJson } from "@/shared/clientApi";
import type { JobStatusData } from "./types";

const TOKENIZATION_API_TIMEOUT_MS = 30000;

type JobStatusResponse = {
  statusCode?: number;
  status?: boolean;
  message?: string;
  data?: JobStatusData;
};

export const fetchJobStatus = async (
  propertyId: string,
): Promise<JobStatusData | null> => {
  try {
    const payload = await requestApiJson<JobStatusResponse>(
      `${INTERNAL_API_PATHS.PROPERTY_ONCHAIN_STATUS}?propertyId=${encodeURIComponent(
        propertyId,
      )}`,
      {
        method: "GET",
        timeoutMs: TOKENIZATION_API_TIMEOUT_MS,
      },
    );

    if (!payload?.status || !payload?.data) {
      return null;
    }

    return payload.data;
  } catch (error) {
    console.warn("[TokenizationFlow] fetchJobStatus returned null", {
      propertyId,
      error,
    });
    return null;
  }
};
