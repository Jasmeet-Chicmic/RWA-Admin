"use client";

import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TABLE_FILTER_LABEL_CLASS } from "@/components/organisms/TableFilters/TableFiltersLayout";

const SEARCH_DEBOUNCE_MS = 300;

export const UsersListSearchInput = () => {
  const t = useTranslations("users");
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const urlSearch = searchParams.get("search") ?? "";
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(localSearch, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const isFocused = document.activeElement === searchInputRef.current;
    if (isFocused) return;
    setLocalSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    const current = (searchParams.get("search") ?? "").trim();
    if (trimmed === current) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("skip");
    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router, searchParams]);

  return (
    <div className="min-w-[220px] flex-1 sm:flex-initial sm:max-w-[320px]">
      <label htmlFor="users-list-search" className={TABLE_FILTER_LABEL_CLASS}>
        {t("searchWallet")}
      </label>
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textparagraph dark:text-textparagraphlight"
        />
        <input
          ref={searchInputRef}
          id="users-list-search"
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t("searchWalletPlaceholder")}
          autoComplete="off"
          className="w-full rounded-xl border border-bordergray200 bg-bgwhite py-2.5 pl-9 pr-3 text-sm text-textprimary transition-all duration-200 placeholder:text-textparagraph focus:border-primarycolor focus:outline-none dark:border-darkbordercolor1 dark:bg-darkbgprimary dark:text-sidebartext"
        />
      </div>
    </div>
  );
};
