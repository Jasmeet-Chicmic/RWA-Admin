import React from "react";

import Header from "@/components/atoms/Header";
import Sidebar from "@/components/atoms/Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

const SecuredLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-lightbgbase dark:bg-darkbgbase">
      <Sidebar />
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
