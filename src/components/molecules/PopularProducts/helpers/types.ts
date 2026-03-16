import { ListingOptionType } from "@/components/atoms/DropdownMenu/utils/types";

export interface Product {
  _id: string;
  name: string;
  itemNumber: string;
  price: number;
}

export interface ListingProductData {
  data: Product[];
  uniqueVisitors: number;
  total: number;
}

export enum LISTING_OPTION_VALUES {
  THIS_WEEK = 1,
  LAST_28_DAYS = 2,
  LAST_MONTH = 3,
  LAST_YEAR = 4,
}

export const LISTING_OPTIONS: ListingOptionType[] = [
  { label: "This Week", value: LISTING_OPTION_VALUES.THIS_WEEK },
  { label: "Last 28 Days", value: LISTING_OPTION_VALUES.LAST_28_DAYS },
  { label: "Last Month", value: LISTING_OPTION_VALUES.LAST_MONTH },
  { label: "Last Year", value: LISTING_OPTION_VALUES.LAST_YEAR },
];
