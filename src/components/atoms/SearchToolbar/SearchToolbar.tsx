"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { debounce } from "@/shared/utils";

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

  const debouncedRedirect = debounce((val: string) => {
    const searchParams = new URLSearchParams();
    if (val) searchParams.set(queryParamName, val);
    router.push(`?${searchParams.toString()}`);
  }, 400);

  const handleChange = (val: string) => {
    setQuery(val);
    debouncedRedirect(val);
  };

  return (
    <SearchInput
      value={query || ""}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

export default SearchToolbar;
