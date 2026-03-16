"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import ReactSelect, { Props as SelectProps, StylesConfig } from "react-select";

import { THEME_TYPE } from "@/shared/constants";

const Select = <OptionType, IsMulti extends boolean = false>(
  props: SelectProps<OptionType, IsMulti>,
) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing document and theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only use dark theme after mount to prevent hydration mismatch
  const isDark = mounted && resolvedTheme === THEME_TYPE.DARK;

  const customStyles: StylesConfig<OptionType, IsMulti> = {
    control: (provided) => ({
      ...provided,
      minHeight: "36px",
      borderColor: isDark ? "#1e2939" : "#E5E7EB",
      borderWidth: "1px",
      borderStyle: "solid",
      borderRadius: "10px",
      backgroundColor: isDark ? "#000000" : "#FFFFFF",
      boxShadow: "none",
      padding: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        borderColor: isDark ? "#1e2939" : "#E5E7EB",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "4px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? "#d1d5db" : "#9CA3AF",
      fontSize: "14px",
      fontWeight: 500,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? "#F9FAFB" : "#1A1A1A",
      fontSize: "14px",
      fontWeight: 500,
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? "#F9FAFB" : "#1A1A1A",
      fontSize: "14px",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: isDark ? "#9CA3AF" : "#d1d5db",
      padding: "6px 8px",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0)",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: isDark ? "#9CA3AF" : "#d1d5db",
      padding: "8px",
      "&:hover": {
        color: "#EF4444",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
      border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
      borderRadius: "12px",
      boxShadow: isDark
        ? "0 10px 40px rgba(0, 0, 0, 0.5)"
        : "0 10px 40px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      marginTop: "4px",
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "6px",
      maxHeight: "250px",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#623022"
        : state.isFocused
          ? isDark
            ? "#374151"
            : "#F3F4F6"
          : "transparent",
      color: state.isSelected ? "#fff" : isDark ? "#F9FAFB" : "#1A1A1A",
      fontSize: "14px",
      fontWeight: state.isSelected ? 600 : 500,
      padding: "10px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: state.isSelected
          ? "#4338CA"
          : isDark
            ? "#4B5563"
            : "#E5E7EB",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#1A1A1A" : "#623022",
      borderRadius: "6px",
      padding: "2px 4px",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDark ? "#F9FAFB" : "#623022",
      fontSize: "13px",
      fontWeight: 500,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDark ? "#9CA3AF" : "#6366F1",
      borderRadius: "4px",
      "&:hover": {
        backgroundColor: isDark ? "#4B5563" : "#C7D2FE",
        color: isDark ? "#F9FAFB" : "#623022",
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: isDark ? "#d1d5db" : "#9CA3AF",
      fontSize: "14px",
      padding: "12px",
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: isDark ? "#d1d5db" : "#9CA3AF",
      fontSize: "14px",
    }),
  };

  return (
    <ReactSelect
      {...props}
      menuPortalTarget={mounted ? document.body : undefined}
      menuPosition="fixed"
      styles={{
        ...customStyles,
        ...(props.styles || {}), // allow custom overrides from props
      }}
    />
  );
};

export default Select;
