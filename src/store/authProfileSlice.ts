import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LOGIN_ROLE } from "@/shared/constants";
import type { Profile } from "@/api/profile";

type AuthProfileState = {
  role: LOGIN_ROLE | null;
  profile: Profile | null;
  isLoading: boolean;
};

const initialState: AuthProfileState = {
  role: null,
  profile: null,
  isLoading: false,
};

const authProfileSlice = createSlice({
  name: "authProfile",
  initialState,
  reducers: {
    setAuthProfileLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAuthProfile(
      state,
      action: PayloadAction<{ role: LOGIN_ROLE; profile: Profile }>,
    ) {
      state.role = action.payload.role;
      state.profile = action.payload.profile;
      state.isLoading = false;
    },
    clearAuthProfile(state) {
      state.role = null;
      state.profile = null;
      state.isLoading = false;
    },
  },
});

export const { setAuthProfileLoading, setAuthProfile, clearAuthProfile } =
  authProfileSlice.actions;

export default authProfileSlice.reducer;
