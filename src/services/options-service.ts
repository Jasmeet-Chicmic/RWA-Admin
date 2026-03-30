import { axiosInstance } from "@/lib/axiosInstance";
import { APP_BASE_PATH } from "@/shared/constants";

export type OptionItem = {
  value: string;
  label: string;
  featureCode?: string;
  defaultValue?: number | null;
};

type OptionsResponse = {
  data: OptionItem[];
  count: number;
};

function withBasePath(path: string): string {
  return `${APP_BASE_PATH}${path}`;
}

export const optionsService = {
  async getDefaultFeatureOptions(params: {
    skip: number;
    limit: number;
    searchText?: string;
  }): Promise<OptionsResponse> {
    const { data } = await axiosInstance.get<OptionsResponse>(
      withBasePath("/api/default-features/options"),
      { params },
    );
    return data;
  },

  async getUserOptions(params: {
    skip: number;
    limit: number;
    isSpotlighted: boolean;
    isActive: boolean;
    searchString?: string;
  }): Promise<OptionsResponse> {
    const { data } = await axiosInstance.get<OptionsResponse>(
      withBasePath("/api/users/options"),
      { params },
    );
    return data;
  },
};
