import { useTheme } from "next-themes";
import { AsyncPaginate, LoadOptions } from "react-select-async-paginate";

import { THEME_TYPE } from "@/shared/constants";
import { SORT_DIRECTION, SORT_DIRECTIONS } from "@/shared/types";

import type { GroupBase, SingleValue, MultiValue } from "react-select";
// Define shape of each option
export interface OptionType {
  label: string;
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow extra data if needed
}
export interface AsyncSelectGetDataParams {
  searchString: string;
  sortDirection: SORT_DIRECTION;
  sortByKey: string;
  page: number;
  limit: number;
}
// Props
interface ReactAsyncSelectProps {
  getData?: (params: AsyncSelectGetDataParams) => Promise<{
    data: OptionType[];
    count: number;
  }>;
  sortKey?: string;
  sortDirType?: SORT_DIRECTION;
  placeholder?: string;
  isMutliOptions?: boolean;
  onChange: (value: SingleValue<OptionType> | MultiValue<OptionType>) => void;
  value?: OptionType | OptionType[] | null;
  disabled?: boolean;
  isClearable?: boolean;
  inputId?: string;
}

const AsyncSelect = ({
  getData,
  sortKey = "name",
  sortDirType = SORT_DIRECTIONS.ASC,
  placeholder = "Select...",
  isMutliOptions = false,
  onChange,
  value,
  disabled = false,
  isClearable = true,
  inputId,
}: ReactAsyncSelectProps) => {
  const LIMIT = 20;

  const loadOptions: LoadOptions<
    OptionType,
    GroupBase<OptionType>,
    { page: number }
  > = async (searchQuery, _, options) => {
    const page = options?.page || 0;
    const params = {
      searchString: searchQuery || "",
      sortDirection: sortDirType,
      sortByKey: sortKey,
      page,
      limit: LIMIT,
    };

    const res = await getData?.(params);

    return {
      options: res?.data || [],
      hasMore: Math.ceil((res?.count || 0) / LIMIT) > page,
      additional: {
        page: page + 1,
      },
    };
  };

  const handleChange = (
    selectedOption: SingleValue<OptionType> | MultiValue<OptionType>,
  ) => {
    if (isMutliOptions) {
      onChange(selectedOption ?? []);
    } else {
      onChange(selectedOption ?? null);
    }
  };

  const { resolvedTheme } = useTheme();

  return (
    <div className="light-mode">
      <AsyncPaginate<OptionType, GroupBase<OptionType>, { page: number }>
        inputId={inputId}
        loadOptions={loadOptions}
        placeholder={placeholder}
        onChange={handleChange}
        additional={{
          page: 1,
        }}
        // @ts-expect-error - isMulti is not a valid prop for AsyncPaginate
        isMulti={isMutliOptions}
        isSearchable={true}
        isClearable={isClearable}
        debounceTimeout={500}
        className={"react-select"}
        classNamePrefix={"react-select-prefix"}
        onBlur={(e) => e.preventDefault()}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value={value as any}
        isDisabled={disabled}
        styles={{
          control: (provided) => ({
            ...provided,
            minHeight: "40px",
            border: `1px solid ${resolvedTheme === THEME_TYPE.DARK ? "#374151" : "#e5e7eb"}`,
            borderRadius: "8px",
            "&:hover": {
              border: `1px solid ${resolvedTheme === THEME_TYPE.DARK ? "#374151" : "#d1d5db"}`,
            },
            backgroundColor:
              resolvedTheme === THEME_TYPE.DARK ? "#111827" : "white",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
          }),
          indicatorSeparator: () => ({
            display: "none",
          }),
          option: (provided) => ({
            ...provided,
            backgroundColor:
              resolvedTheme === THEME_TYPE.DARK ? "#111827" : "white",
            color: resolvedTheme === THEME_TYPE.DARK ? "#9ca3af" : "black",
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor:
              resolvedTheme === THEME_TYPE.DARK ? "#111827" : "white",
          }),
        }}
      />
    </div>
  );
};

export default AsyncSelect;
