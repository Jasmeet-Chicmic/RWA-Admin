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
  variant?: "default" | "modalDark";
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
  variant = "default",
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
  const isDarkSurface =
    variant === "modalDark" || resolvedTheme === THEME_TYPE.DARK;
  const surfaceColor = isDarkSurface ? "#171717" : "white";
  const menuColor = isDarkSurface ? "#1d1d1d" : "white";
  const focusedOptionColor = isDarkSurface ? "#343434" : "#f3f4f6";

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
            border: "none",
            boxShadow: "none",
            borderRadius: "8px",
            "&:hover": {
              border: "none",
            },
            backgroundColor: surfaceColor,
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "#9ca3af",
          }),
          indicatorSeparator: () => ({
            display: "none",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? "#C7FE1E"
              : state.isFocused
                ? focusedOptionColor
                : "transparent",
            color: state.isSelected
              ? "#000000"
              : isDarkSurface
                ? "#f3f4f6"
                : "black",
            ":active": {
              backgroundColor: state.isSelected
                ? "#C7FE1E"
                : focusedOptionColor,
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            color: isDarkSurface ? "#f3f4f6" : "#111827",
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: menuColor,
            border: "none",
            boxShadow: "none",
          }),
          menuList: (provided) => ({
            ...provided,
            ...(variant === "modalDark"
              ? {
                  paddingTop: 6,
                  paddingBottom: 6,
                }
              : {}),
          }),
        }}
      />
    </div>
  );
};

export default AsyncSelect;
