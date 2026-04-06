"use client";

import SelectFilter from "@/components/atoms/SelectFilter";
import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

const LABEL_CLASS =
  "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

export const UsersListFilters = () => {
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

  const kycOptions = useMemo(
    () => [
      { label: t("kyc.notStarted"), value: "0" },
      { label: t("kyc.pending"), value: "1" },
      { label: t("kyc.approved"), value: "2" },
      { label: t("kyc.rejected"), value: "3" },
    ],
    [t],
  );

  return (
    <div className="flex flex-wrap items-end justify-end gap-3">
      <div className="min-w-[200px] flex-1 sm:flex-initial sm:max-w-[280px]">
        <label htmlFor="users-list-search" className={LABEL_CLASS}>
          {t("searchWallet")}
        </label>
        <input
          ref={searchInputRef}
          id="users-list-search"
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t("searchWalletPlaceholder")}
          autoComplete="off"
          className="w-full px-3 py-2.5 border-2 border-primarycolor rounded-lg focus:ring-0 transition-all duration-200 dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext"
        />
      </div>

      <div className="min-w-[200px]">
        <label htmlFor="users-kyc-status-filter" className={LABEL_CLASS}>
          {t("kycStatus")}
        </label>
        <SelectFilter
          id="users-kyc-status-filter"
          paramName="kycStatus"
          options={kycOptions}
          placeholder={t("selectKycStatus")}
        />
      </div>
    </div>
  );
};
