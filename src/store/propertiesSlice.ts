import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { propertiesService } from "@/services/properties-service";
import {
  AllPropertiesResponse,
  GetAllPropertiesParams,
  PropertyDetailsItem,
  PropertyItem,
} from "@/types/properties";

type PropertyListState = {
  items: PropertyItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
};

type PropertyOrganisationRow = {
  id: string;
  name: string;
  entityType: "LLC" | "SPV" | "Trust";
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  propertyHolds: number;
};

type PropertyOrganisationListState = {
  items: PropertyOrganisationRow[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
};

type PropertyDetailsState = {
  item: PropertyDetailsItem | null;
  isLoading: boolean;
  error: string | null;
};

type PropertiesState = {
  all: PropertyListState;
  organisation: PropertyListState;
  propertyOrganisations: PropertyOrganisationListState;
  details: PropertyDetailsState;
};

const initialListState: PropertyListState = {
  items: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

const initialState: PropertiesState = {
  all: initialListState,
  organisation: initialListState,
  propertyOrganisations: {
    items: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  },
  details: {
    item: null,
    isLoading: false,
    error: null,
  },
};

export const fetchAllProperties = createAsyncThunk<
  AllPropertiesResponse,
  GetAllPropertiesParams,
  { rejectValue: string }
>("properties/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await propertiesService.getAllProperties(params);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch properties",
    );
  }
});

export const fetchOrganisationProperties = createAsyncThunk<
  AllPropertiesResponse,
  { page: number; pageSize: number; status?: number; search?: string },
  { rejectValue: string }
>("properties/fetchOrganisation", async (params, { rejectWithValue }) => {
  try {
    return await propertiesService.getOrganisationProperties(params);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch organisation properties",
    );
  }
});

export const fetchAdminSpecificOrganisationProperties = createAsyncThunk<
  AllPropertiesResponse,
  {
    organizationId: string;
    page: number;
    pageSize: number;
    status?: number;
    search?: string;
  },
  { rejectValue: string }
>(
  "properties/fetchAdminSpecificOrganisation",
  async (params, { rejectWithValue }) => {
    try {
      return await propertiesService.getAdminSpecificOrganisationProperties(
        params,
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch admin organisation properties",
      );
    }
  },
);

export const fetchPropertyOrganisations = createAsyncThunk<
  { items: PropertyOrganisationRow[]; totalCount: number },
  { page: number; pageSize: number },
  { rejectValue: string }
>(
  "properties/fetchPropertyOrganisations",
  async (params, { rejectWithValue }) => {
    try {
      return await propertiesService.getPropertyOrganisations(params);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch organisations for properties",
      );
    }
  },
);

export const fetchPropertyDetails = createAsyncThunk<
  PropertyDetailsItem,
  { propertyId: string; scope?: "admin" | "organisation" },
  { rejectValue: string }
>("properties/fetchDetails", async (params, { rejectWithValue }) => {
  try {
    return await propertiesService.getPropertyDetails(
      params.propertyId,
      params.scope ?? "admin",
    );
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch property details",
    );
  }
});

const propertiesSlice = createSlice({
  name: "properties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProperties.pending, (state) => {
        state.all.isLoading = true;
        state.all.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.all.isLoading = false;
        state.all.items = action.payload.items;
        state.all.totalCount = action.payload.totalCount;
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.all.isLoading = false;
        state.all.error = action.payload ?? "Failed to fetch properties";
      })
      .addCase(fetchOrganisationProperties.pending, (state) => {
        state.organisation.isLoading = true;
        state.organisation.error = null;
      })
      .addCase(fetchOrganisationProperties.fulfilled, (state, action) => {
        state.organisation.isLoading = false;
        state.organisation.items = action.payload.items;
        state.organisation.totalCount = action.payload.totalCount;
      })
      .addCase(fetchOrganisationProperties.rejected, (state, action) => {
        state.organisation.isLoading = false;
        state.organisation.error =
          action.payload ?? "Failed to fetch organisation properties";
      })
      .addCase(fetchAdminSpecificOrganisationProperties.pending, (state) => {
        state.organisation.isLoading = true;
        state.organisation.error = null;
      })
      .addCase(
        fetchAdminSpecificOrganisationProperties.fulfilled,
        (state, action) => {
          state.organisation.isLoading = false;
          state.organisation.items = action.payload.items;
          state.organisation.totalCount = action.payload.totalCount;
        },
      )
      .addCase(
        fetchAdminSpecificOrganisationProperties.rejected,
        (state, action) => {
          state.organisation.isLoading = false;
          state.organisation.error =
            action.payload ?? "Failed to fetch organisation properties";
        },
      )
      .addCase(fetchPropertyOrganisations.pending, (state) => {
        state.propertyOrganisations.isLoading = true;
        state.propertyOrganisations.error = null;
      })
      .addCase(fetchPropertyOrganisations.fulfilled, (state, action) => {
        state.propertyOrganisations.isLoading = false;
        state.propertyOrganisations.items = action.payload.items;
        state.propertyOrganisations.totalCount = action.payload.totalCount;
      })
      .addCase(fetchPropertyOrganisations.rejected, (state, action) => {
        state.propertyOrganisations.isLoading = false;
        state.propertyOrganisations.error =
          action.payload ?? "Failed to fetch organisations for properties";
      })
      .addCase(fetchPropertyDetails.pending, (state) => {
        state.details.isLoading = true;
        state.details.error = null;
      })
      .addCase(fetchPropertyDetails.fulfilled, (state, action) => {
        state.details.isLoading = false;
        state.details.item = action.payload;
      })
      .addCase(fetchPropertyDetails.rejected, (state, action) => {
        state.details.isLoading = false;
        state.details.error =
          action.payload ?? "Failed to fetch property details";
      });
  },
});

export default propertiesSlice.reducer;
