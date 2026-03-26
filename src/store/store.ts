import { configureStore } from "@reduxjs/toolkit";
import authProfileReducer from "./authProfileSlice";

export const store = configureStore({
  reducer: {
    authProfile: authProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
