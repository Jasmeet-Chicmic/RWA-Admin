import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import ReactPaginate from "react-paginate";

import Button from "./Button";

type PaginationProps = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (selectedPage: number) => void;
  onPageSizeChange: (size: number) => void;
  title: string;
  className?: string;
};
export const PageLabel = ({
  page,
  currentPage,
}: {
  page: number;
  currentPage: number;
}) => (
  <Button
    variant={page === currentPage ? "primary" : "ghost"}
    size="sm"
    className={`w-8 h-8 p-0 min-w-0 flex items-center justify-center transition-all ${
      page === currentPage
        ? "shadow-sm shadow-bgpurple1/20 dark:text-black"
        : "text-black bg-primarycolor/5 dark:text-black dark:bg-secondarycolor/5 dark:text-bgwhite/50 hover:bg-primarycolor/10 dark:hover:bg-secondarycolor/10"
    }`}
  >
    {page}
  </Button>
);

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className,
  title = "items",
}) => {
  const t = useTranslations("common");
  const totalPages = Math.ceil(totalItems / pageSize);
  const [inputPage, setInputPage] = useState("");
  const fromItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalItems);

  const handleJump = () => {
    const page = Number.parseInt(inputPage, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page - 1); // react-paginate uses 0-based index
      setInputPage("");
    }
  };

  return (
    <div
      className={`bg-bgwhite p-[9px_10px] lg:px-6 lg:py-5 rounded-b-[20px] flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 border-t border-b border-bordergray200ordercolor1 dark:bg-darkbgprimary dark:border-darkbordercolor1 ${className}`}
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:gap-0 items-center space-x-6">
        {/* Page size selector */}
        <div className="flex items-center space-x-3">
          <label
            htmlFor="pageSize"
            className="text-sm font-semibold text-textprimary dark:text-secondary"
          >
            {t("paginationShow")}
          </label>
          <div className="relative">
            <select
              id="pageSize"
              className="appearance-none border border-bordergray100 rounded-[10px] px-3 py-1.5 text-sm bg-bgwhite text-textprimary font-medium outline-none hover:border-[#5f5f5f] focus:border-transparent cursor-pointer transition-all dark:bg-darkbgprimary dark:border-[#5f5f5f] min-w-[70px] dark:text-white"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={totalItems === 0}
            >
              {[10, 20, 50, 100].map((size) => (
                <option className="dark:text-white" key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-textprimary dark:text-secondary">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Show count info */}
        {totalItems === 0 ? (
          <p className="text-[0.875rem] text-textprimary dark:text-textparagraphlight"></p>
        ) : (
          <p className="text-[0.875rem] text-textprimary dark:text-textparagraphlight">
            {t("paginationShowing", {
              from: fromItem,
              to: toItem,
              total: totalItems,
              title,
            })}
          </p>
        )}
      </div>

      {totalPages > 0 && (
        <div className="flex items-center space-x-4 lg:flex-row gap-4 flex-col w-full lg:w-auto">
          {/* Pagination */}
          <ReactPaginate
            pageCount={totalPages}
            forcePage={currentPage - 1}
            onPageChange={(selected) => onPageChange(selected.selected)}
            containerClassName="flex space-x-1 items-center"
            pageClassName="rounded-md overflow-hidden"
            activeClassName="active"
            disabledClassName="opacity-30 cursor-not-allowed"
            previousLabel={
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0 min-w-0 text-textprimary dark:text-white bg-bgwhite dark:bg-darkbgprimary border border-bordergray100 dark:border-[#5f5f5f] hover:border-[#5f5f5f] dark:hover:border-white/60 hover:bg-gray-50 dark:hover:bg-labelprimary transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            }
            nextLabel={
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0 min-w-0 text-textprimary dark:text-white bg-bgwhite dark:bg-darkbgprimary border border-bordergray100 dark:border-[#5f5f5f] hover:border-[#5f5f5f] dark:hover:border-white/60 hover:bg-gray-50 dark:hover:bg-labelprimary transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            }
            pageLabelBuilder={(page) => (
              <PageLabel page={page} currentPage={currentPage} />
            )}
            breakLabel={<span className="bordercolor1 px-1">...</span>}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
          />

          {/* Jump to page */}
          <div className="flex items-center space-x-2 bg-gray-50 dark:bg-darkbgprimary p-1 rounded-[10px] border border-bordergray100 dark:border-labelprimary">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-16 bg-transparent border-none px-2 py-1 text-sm font-bold text-textprimary dark:text-gray-200 outline-none placeholder:font-medium placeholder:bordercolor1"
              placeholder={t("paginationPagePlaceholder")}
              value={inputPage}
              onChange={(e) =>
                setInputPage(e.target.value.replace(/[^\d]/g, ""))
              }
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleJump}
              disabled={!inputPage}
              className="h-[28px] rounded-[8px] px-3 text-[0.875] font-bold bg-primarycolor hover:bg-bgprimary dark:!text-black"
            >
              {t("paginationGo")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
