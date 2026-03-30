"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import SearchInput from "../SearchInput";

interface Props {
  initialQuery?: string;
  placeholder: string;
  /** Query param name for the search value (default: "searchString") */
  queryParamName?: string;
}

const SearchToolbar = ({
  initialQuery,
  placeholder,
  queryParamName = "searchString",
}: Props) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (debouncedQuery) searchParams.set(queryParamName, debouncedQuery);
    router.push(`?${searchParams.toString()}`);
  }, [debouncedQuery, queryParamName, router]);

  return (
    <SearchInput
      value={query || ""}
      onChange={setQuery}
      placeholder={placeholder}
    />
  );
};

export default SearchToolbar;
