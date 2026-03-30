import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { authService } from "@/services/auth-service";
import { LOGIN_ROLE } from "@/shared/constants";

type AuthFlowState = {
  loginNonceLoading: boolean;
  loginNonceError: string | null;
  walletVerifyLoading: boolean;
  walletVerifyError: string | null;
};

const initialState: AuthFlowState = {
  loginNonceLoading: false,
  loginNonceError: null,
  walletVerifyLoading: false,
  walletVerifyError: null,
};

export const requestLoginNonceThunk = createAsyncThunk(
  "auth/requestLoginNonce",
  async (
    payload: { role: LOGIN_ROLE; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      return await authService.requestLoginNonce(payload.role, {
        email: payload.email,
        password: payload.password,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login request failed",
      );
    }
  },
);

export const verifyWalletThunk = createAsyncThunk(
  "auth/verifyWallet",
  async (
    payload: {
      role: LOGIN_ROLE;
      message: string;
      signature: string;
      tempToken: string;
    },
    { rejectWithValue },
  ) => {
    try {
      return await authService.verifyWalletSignature(
        payload.role,
        {
          message: payload.message,
          signature: payload.signature,
        },
        payload.tempToken,
      );
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Wallet verification failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "authFlow",
  initialState,
  reducers: {
    clearAuthFlowErrors(state) {
      state.loginNonceError = null;
      state.walletVerifyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestLoginNonceThunk.pending, (state) => {
        state.loginNonceLoading = true;
        state.loginNonceError = null;
      })
      .addCase(requestLoginNonceThunk.fulfilled, (state) => {
        state.loginNonceLoading = false;
      })
      .addCase(requestLoginNonceThunk.rejected, (state, action) => {
        state.loginNonceLoading = false;
        state.loginNonceError =
          (action.payload as string) ?? "Login request failed";
      })
      .addCase(verifyWalletThunk.pending, (state) => {
        state.walletVerifyLoading = true;
        state.walletVerifyError = null;
      })
      .addCase(verifyWalletThunk.fulfilled, (state) => {
        state.walletVerifyLoading = false;
      })
      .addCase(verifyWalletThunk.rejected, (state, action) => {
        state.walletVerifyLoading = false;
        state.walletVerifyError =
          (action.payload as string) ?? "Wallet verification failed";
      });
  },
});

export const { clearAuthFlowErrors } = authSlice.actions;
export default authSlice.reducer;
