"use client";

import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "@/store/store";
import GlobalLoader from "@/components/atoms/GlobalLoader/GlobalLoader";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <GlobalLoader />
      {children}
    </Provider>
  );
}
