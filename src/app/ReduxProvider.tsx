"use client";

import { Provider } from "react-redux";
import type { ReactNode } from "react";
import { store } from "@/store/store";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
