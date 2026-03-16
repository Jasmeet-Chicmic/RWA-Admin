import { useMemo } from "react";
import { GAME_TYPE_NAMES } from "@/shared/constants";
import { RevenuePerGameItem } from "@/api/dashboard";

/**
 * Custom hook to process revenue per game data
 * Handles sorting, categorization, and revenue splitting
 */
export const useRevenuePerGameData = (data: RevenuePerGameItem[]) => {
  // Sort by revenue descending
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => b.grossGamingRevenue - a.grossGamingRevenue,
    );
  }, [data]);

  // Map game types to readable names
  const categories = useMemo(
    () =>
      sortedData.map(
        (item) => GAME_TYPE_NAMES[item.gameType] || `Game ${item.gameType}`,
      ),
    [sortedData],
  );

  // Split data into positive and negative for different gradient directions
  const positiveRevenue = useMemo(
    () => sortedData.map((item) => Math.max(0, item.grossGamingRevenue)),
    [sortedData],
  );

  const negativeRevenue = useMemo(
    () => sortedData.map((item) => Math.min(0, item.grossGamingRevenue)),
    [sortedData],
  );

  // Calculate total revenue
  const totalRevenue = useMemo(
    () => data.reduce((sum, item) => sum + item.grossGamingRevenue, 0),
    [data],
  );

  return {
    sortedData,
    categories,
    positiveRevenue,
    negativeRevenue,
    totalRevenue,
  };
};
