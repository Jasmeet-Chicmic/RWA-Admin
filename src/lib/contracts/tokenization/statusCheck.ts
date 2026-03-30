import { propertyOnchainService } from "@/services/property-onchain-service";
import type { JobStatusData } from "./types";

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
    const payload = (await propertyOnchainService.status({
      propertyId,
    })) as JobStatusResponse;

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
