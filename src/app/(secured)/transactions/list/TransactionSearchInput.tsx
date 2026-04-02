"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 300;

const LABEL_CLASS =
  "block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2";

type TransactionSearchInputProps = {
  inputId: string;
};

export const TransactionSearchInput = ({
  inputId,
}: TransactionSearchInputProps) => {
  const t = useTranslations("transactions");
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
    <div className="min-w-[200px] flex-1 sm:flex-initial sm:max-w-[280px]">
      <label htmlFor={inputId} className={LABEL_CLASS}>
        {t("searchTransactions")}
      </label>
      <input
        ref={searchInputRef}
        id={inputId}
        type="search"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder={t("searchTransactions")}
        autoComplete="off"
        className="w-full px-3 py-2.5 border-2 border-primarycolor rounded-lg focus:ring-0 transition-all duration-200 dark:bg-darkbgprimary dark:border-darkbordercolor1 dark:text-sidebartext"
      />
    </div>
  );
};
