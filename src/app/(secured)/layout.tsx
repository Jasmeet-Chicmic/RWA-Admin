import React from "react";

import Header from "@/components/atoms/Header";
import Sidebar from "@/components/atoms/Sidebar";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { LOGIN_ROLE } from "@/shared/constants";

type LayoutProps = {
  children: React.ReactNode;
};

const SecuredLayout: React.FC<LayoutProps> = async ({ children }) => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const role = session?.role as LOGIN_ROLE;

  return (
    <div className="min-h-screen bg-lightbgbase dark:bg-darkbgbase">
      <Sidebar initialRole={role} />
      <div className="flex-1 flex flex-col lg:ml-72 py-6 pl-0">
        <div className="custom-container w-full">
          <Header />
          <main className="flex-1 mt-[20px] lg:mt-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default SecuredLayout;
