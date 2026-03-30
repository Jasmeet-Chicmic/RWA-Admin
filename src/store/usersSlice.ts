import {
  GetUsersListParams,
  UserPortfolioItem,
  usersService,
} from "@/services/users-service";
import { Role } from "@/shared/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type UsersState = {
  list: {
    items: UserPortfolioItem[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
  };
  roles: {
    items: Role[];
    isLoading: boolean;
    error: string | null;
  };
};

const initialState: UsersState = {
  list: {
    items: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  },
  roles: {
    items: [],
    isLoading: false,
    error: null,
  },
};

export const fetchUsersList = createAsyncThunk<
  { items: UserPortfolioItem[]; totalCount: number },
  GetUsersListParams,
  { rejectValue: string }
>("users/fetchList", async (params, { rejectWithValue }) => {
  try {
    const payload = await usersService.getUsers(params);
    return {
      items: payload.items ?? [],
      totalCount: payload.totalCount ?? 0,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch users",
    );
  }
});

export const fetchRolesOptions = createAsyncThunk<
  Role[],
  void,
  { rejectValue: string }
>("users/fetchRoles", async (_, { rejectWithValue }) => {
  try {
    return await usersService.getRoles();
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch roles",
    );
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.list.isLoading = true;
        state.list.error = null;
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.list.isLoading = false;
        state.list.items = action.payload.items;
        state.list.totalCount = action.payload.totalCount;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.list.isLoading = false;
        state.list.error = action.payload ?? "Failed to fetch users";
      })
      .addCase(fetchRolesOptions.pending, (state) => {
        state.roles.isLoading = true;
        state.roles.error = null;
      })
      .addCase(fetchRolesOptions.fulfilled, (state, action) => {
        state.roles.isLoading = false;
        state.roles.items = action.payload;
      })
      .addCase(fetchRolesOptions.rejected, (state, action) => {
        state.roles.isLoading = false;
        state.roles.error = action.payload ?? "Failed to fetch roles";
      });
  },
});

export default usersSlice.reducer;
