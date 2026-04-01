import Image from "next/image";
import React from "react";

import { authBg, authImg } from "@/assets";

import { FormLayoutType } from "./helpers/constants";

interface FormLayoutProps {
  layout?: FormLayoutType;
  children: React.ReactNode;
}

const FormLayout = ({
  layout = FormLayoutType.Default,
  children,
}: FormLayoutProps) => {
  if (layout === FormLayoutType.WithCover) {
    return (
      <div className="flex min-h-screen bg-bgwhite dark:bg-darkbgprimary">
        <div className="hidden xl:flex w-full items-center justify-center bg-[#f8f7fa] relative xl:w-[66.66%] dark:bg-darkbgprimary">
          <Image
            src={authImg}
            alt="Authentication illustration"
            width={700}
            height={550}
            priority
            className="max-h-[65%] w-auto"
          />
          <Image
            src={authBg}
            width={700}
            height={550}
            alt="Authentication Background"
            className="absolute bottom-0 left-0 w-full h-[35%]"
          />
        </div>

        <div className="flex w-full items-center justify-center p-[24px] sm:p-[48px] xl:w-[33.33%] dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext">
          <div className="w-full max-w-[400px] mx-auto mt-[50px] dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-lightbgbase dark:bg-darkbgbase rounded-[8px]">
      <div className="p-8 rounded-lg shadow-md w-full w-[448px] bg-darkbgprimary border-darkbordercolor1 text-sidebartext">
        {children}
      </div>
    </div>
  );
};

export default FormLayout;
