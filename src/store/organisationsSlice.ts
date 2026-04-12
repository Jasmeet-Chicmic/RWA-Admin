import {
  AdminOrganisation,
  OrganisationProfile,
  organisationsService,
} from "@/services/organisations-service";
import { sessionService } from "@/services/session-service";
import { LOGIN_ROLE } from "@/shared/constants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type OrganisationsState = {
  role: LOGIN_ROLE | null;
  profile: OrganisationProfile | null;
  list: {
    items: AdminOrganisation[];
    totalCount: number;
    isLoading: boolean;
    /** False until first admin list request finishes (success or error). */
    hasInitiallyFetched: boolean;
    error: string | null;
  };
  sessionLoading: boolean;
  sessionError: string | null;
};

const initialState: OrganisationsState = {
  role: null,
  profile: null,
  list: {
    items: [],
    totalCount: 0,
    isLoading: false,
    hasInitiallyFetched: false,
    error: null,
  },
  sessionLoading: false,
  sessionError: null,
};

export const fetchSessionRole = createAsyncThunk<
  LOGIN_ROLE | null,
  void,
  { rejectValue: string }
>("organisations/fetchSessionRole", async (_, { rejectWithValue }) => {
  try {
    const payload = await sessionService.getSession();
    return payload.role ?? null;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch session role",
    );
  }
});

export const fetchOrganisationProfile = createAsyncThunk<
  OrganisationProfile | null,
  void,
  { rejectValue: string }
>("organisations/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    return await organisationsService.getOrganisationProfile();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch profile",
    );
  }
});

export const fetchAdminOrganisations = createAsyncThunk<
  { items: AdminOrganisation[]; totalCount: number },
  { page: number; pageSize: number },
  { rejectValue: string }
>("organisations/fetchAdminList", async (params, { rejectWithValue }) => {
  try {
    const payload = await organisationsService.getAdminOrganisations(params);
    return {
      items: payload.items ?? [],
      totalCount: payload.totalCount ?? 0,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch organisations",
    );
  }
});

const organisationsSlice = createSlice({
  name: "organisations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSessionRole.pending, (state) => {
        state.sessionLoading = true;
        state.sessionError = null;
      })
      .addCase(fetchSessionRole.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.role = action.payload;
      })
      .addCase(fetchSessionRole.rejected, (state, action) => {
        state.sessionLoading = false;
        state.sessionError = action.payload ?? "Failed to fetch session role";
      })
      .addCase(fetchOrganisationProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(fetchAdminOrganisations.pending, (state) => {
        state.list.isLoading = true;
        state.list.error = null;
      })
      .addCase(fetchAdminOrganisations.fulfilled, (state, action) => {
        state.list.isLoading = false;
        state.list.hasInitiallyFetched = true;
        state.list.items = action.payload.items;
        state.list.totalCount = action.payload.totalCount;
      })
      .addCase(fetchAdminOrganisations.rejected, (state, action) => {
        state.list.isLoading = false;
        state.list.hasInitiallyFetched = true;
        state.list.error = action.payload ?? "Failed to fetch organisations";
      });
  },
});

export default organisationsSlice.reducer;
