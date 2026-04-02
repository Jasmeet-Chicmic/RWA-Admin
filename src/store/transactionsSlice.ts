import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  AdminTransactionItem,
  transactionsService,
} from "@/services/transactions-service";
import { GetAdminTransactionsParams } from "@/shared/types";

type TransactionsState = {
  list: {
    items: AdminTransactionItem[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
  };
};

const initialState: TransactionsState = {
  list: {
    items: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  },
};

export const fetchTransactionsList = createAsyncThunk<
  { items: AdminTransactionItem[]; totalCount: number },
  GetAdminTransactionsParams,
  { rejectValue: string }
>("transactions/fetchList", async (params, { rejectWithValue }) => {
  try {
    const payload = await transactionsService.getTransactions(params);
    return {
      items: payload.transactions ?? [],
      totalCount: payload.totalCount ?? 0,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch transactions",
    );
  }
});

export const fetchOrganisationTransactionsList = createAsyncThunk<
  { items: AdminTransactionItem[]; totalCount: number },
  GetAdminTransactionsParams,
  { rejectValue: string }
>("transactions/fetchOrganisationList", async (params, { rejectWithValue }) => {
  try {
    const payload =
      await transactionsService.getOrganisationTransactions(params);
    return {
      items: payload.transactions ?? [],
      totalCount: payload.totalCount ?? 0,
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch transactions",
    );
  }
});

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionsList.pending, (state) => {
        state.list.isLoading = true;
        state.list.error = null;
        state.list.items = [];
        state.list.totalCount = 0;
      })
      .addCase(fetchTransactionsList.fulfilled, (state, action) => {
        state.list.isLoading = false;
        state.list.items = action.payload.items;
        state.list.totalCount = action.payload.totalCount;
      })
      .addCase(fetchTransactionsList.rejected, (state, action) => {
        state.list.isLoading = false;
        state.list.error = action.payload ?? "Failed to fetch transactions";
      });

    builder
      .addCase(fetchOrganisationTransactionsList.pending, (state) => {
        state.list.isLoading = true;
        state.list.error = null;
        state.list.items = [];
        state.list.totalCount = 0;
      })
      .addCase(fetchOrganisationTransactionsList.fulfilled, (state, action) => {
        state.list.isLoading = false;
        state.list.items = action.payload.items;
        state.list.totalCount = action.payload.totalCount;
      })
      .addCase(fetchOrganisationTransactionsList.rejected, (state, action) => {
        state.list.isLoading = false;
        state.list.error =
          action.payload ?? "Failed to fetch organisation transactions";
      });
  },
});

export default transactionsSlice.reducer;
