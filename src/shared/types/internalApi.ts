export type InitiateOnchainTrackingResponse = {
  statusCode?: number;
  status?: boolean;
  message?: string;
  data?: {
    jobId?: string;
  };
};

export type InternalApiBaseResponse = {
  statusCode?: number;
  status?: boolean;
  message?: string;
};
