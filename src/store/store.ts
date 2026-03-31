import { configureStore } from "@reduxjs/toolkit";
import analyticsReducer from "./analyticsSlice";
import authProfileReducer from "./authProfileSlice";
import authFlowReducer from "./authSlice";
import organisationsReducer from "./organisationsSlice";
import propertiesReducer from "./propertiesSlice";
import transactionsReducer from "./transactionsSlice";
import usersReducer from "./usersSlice";

export const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    authProfile: authProfileReducer,
    authFlow: authFlowReducer,
    organisations: organisationsReducer,
    properties: propertiesReducer,
    transactions: transactionsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
