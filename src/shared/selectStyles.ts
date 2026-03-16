import { StylesConfig } from "react-select";
import { CHART_COLORS } from "@/shared/constants";

const hexToRGBA = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getColorScheme = (isPositive: boolean, isDark: boolean) => {
  if (isPositive) {
    const baseColor = isDark ? CHART_COLORS.SECONDARY : CHART_COLORS.PRIMARY;
    return {
      background: hexToRGBA(baseColor, isDark ? 0.1 : 0.05),
      border: hexToRGBA(baseColor, isDark ? 0.2 : 0.1),
      hoverBorder: hexToRGBA(baseColor, isDark ? 0.4 : 0.2),
      text: baseColor,
      optionSelected: hexToRGBA(baseColor, isDark ? 0.2 : 0.1),
      optionFocused: hexToRGBA(baseColor, isDark ? 0.1 : 0.05),
      optionActive: hexToRGBA(baseColor, isDark ? 0.15 : 0.08),
    };
  }

  const redBase = "#EF4444";
  return isDark
    ? {
        background: hexToRGBA(redBase, 0.1),
        border: hexToRGBA(redBase, 0.2),
        hoverBorder: hexToRGBA(redBase, 0.4),
        text: "#F87171",
        optionSelected: hexToRGBA(redBase, 0.2),
        optionFocused: hexToRGBA(redBase, 0.1),
        optionActive: hexToRGBA(redBase, 0.15),
      }
    : {
        background: "#fef2f2",
        border: "#fecaca",
        hoverBorder: "#fca5a5",
        text: "#b91c1c",
        optionSelected: "#fef2f2",
        optionFocused: "#fef2f2",
        optionActive: "#fee2e2",
      };
};

export const getStatusSelectStyles = <
  OptionType extends { value: unknown; label: string },
>(
  isPositive: boolean,
  isDark: boolean,
): StylesConfig<OptionType, false> => {
  const colors = getColorScheme(isPositive, isDark);
  const neutralTextColor = isDark ? "#9ca3af" : "#374151";
  const menuBorder = isDark ? "#1e2939" : "#e5e7eb";
  const menuBackground = isDark ? "#1A1A1A" : "white";

  return {
    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      height: "32px",
      fontSize: "12px",
      borderRadius: "9999px",
      backgroundColor: colors.background,
      borderColor: colors.border,
      boxShadow: "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: colors.hoverBorder,
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 12px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: colors.text,
      fontWeight: "600",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "0 8px 0 0",
      color: colors.text,
      "&:hover": {
        color: colors.text,
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "12px",
      overflow: "hidden",
      border: `1px solid ${menuBorder}`,
      boxShadow: isDark
        ? "0 10px 40px rgba(0, 0, 0, 0.5)"
        : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      backgroundColor: menuBackground,
      marginTop: "4px",
    }),
    option: (provided, state) => {
      const optionValue = state.data.value;
      const optionColors = getColorScheme(
        typeof optionValue === "boolean"
          ? optionValue
          : optionValue === "true" || optionValue === "active",
        isDark,
      );

      let backgroundColor = "transparent";
      let textColor = neutralTextColor;

      if (state.isSelected) {
        backgroundColor = optionColors.optionSelected;
        textColor = optionColors.text;
      } else if (state.isFocused) {
        backgroundColor = optionColors.optionFocused;
        textColor = optionColors.text;
      }

      return {
        ...provided,
        backgroundColor,
        color: textColor,
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:active": {
          backgroundColor: optionColors.optionActive,
        },
      };
    },
  };
};

export const getSelectStyles = <
  OptionType extends { value: unknown; label: string },
>(
  isDark: boolean,
): StylesConfig<OptionType, false> => {
  const menuBorder = isDark ? "#1e2939" : "#e5e7eb";
  const menuBackground = isDark ? "#1A1A1A" : "white";
  const controlBg = isDark ? "#0A0A0A" : "#FFFFFF";
  const controlBorder = isDark ? "#1e2939" : "#E5E7EB";

  return {
    control: (provided) => ({
      ...provided,
      minHeight: "36px",
      fontSize: "14px",
      borderRadius: "10px",
      backgroundColor: controlBg,
      borderColor: controlBorder,
      boxShadow: "none",
      cursor: "pointer",
      "&:hover": {
        borderColor: isDark ? "#374151" : "#D1D5DB",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 12px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? "#F9FAFB" : "#1A1A1A",
      fontWeight: "500",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? "#9ca3af" : "#94a3b8",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: isDark ? "#9CA3AF" : "#94a3b8",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "12px",
      overflow: "hidden",
      border: `1px solid ${menuBorder}`,
      boxShadow: isDark
        ? "0 10px 40px rgba(0, 0, 0, 0.5)"
        : "0 10px 40px rgba(0, 0, 0, 0.1)",
      backgroundColor: menuBackground,
      marginTop: "4px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? isDark
          ? hexToRGBA(CHART_COLORS.SECONDARY, 0.2)
          : hexToRGBA(CHART_COLORS.PRIMARY, 0.1)
        : state.isFocused
          ? isDark
            ? "#262626"
            : "#F3F4F6"
          : "transparent",
      color: state.isSelected
        ? isDark
          ? CHART_COLORS.SECONDARY
          : CHART_COLORS.PRIMARY
        : isDark
          ? "#F9FAFB"
          : "#1A1A1A",
      fontSize: "14px",
      fontWeight: state.isSelected ? 600 : 500,
      cursor: "pointer",
      "&:active": {
        backgroundColor: isDark ? "#374151" : "#E5E7EB",
      },
    }),
  };
};
