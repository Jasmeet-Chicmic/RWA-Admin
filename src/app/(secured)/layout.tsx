import React from "react";

import Header from "@/components/atoms/Header";
import Sidebar from "@/components/atoms/Sidebar";
import RouteGuard from "@/components/guards/RouteGuard";
import { LOGIN_ROLE } from "@/shared/constants";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";

type LayoutProps = {
  children: React.ReactNode;
};

const SecuredLayout: React.FC<LayoutProps> = async ({ children }) => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const rawRole = session?.role;
  const serverRole: LOGIN_ROLE | undefined =
    rawRole != null && Object.values(LOGIN_ROLE).includes(rawRole as LOGIN_ROLE)
      ? (rawRole as LOGIN_ROLE)
      : undefined;

  return (
    <div className="min-h-screen bg-lightbgbase dark:bg-darkbgbase">
      <Sidebar initialRole={serverRole} />
      <div className="flex-1 flex flex-col lg:ml-72 py-6 pl-0">
        <div className="custom-container w-full">
          <Header />
          <main className="flex-1 mt-[20px] lg:mt-8">
            <RouteGuard initialRole={serverRole}>{children}</RouteGuard>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SecuredLayout;
