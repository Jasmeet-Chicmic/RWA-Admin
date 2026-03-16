import { ListingOptionType } from "@/components/atoms/DropdownMenu/utils/types";
import { ReactNode } from "react";

export const GRAPHICS_TYPES = { IMAGE: "image", ICON: "icon" } as const;
export type GraphicsType = (typeof GRAPHICS_TYPES)[keyof typeof GRAPHICS_TYPES];
export const LISTING_CARD_TYPES = {
  SALES: "sales",
  TRANSACTION: "transaction",
} as const;
export type ListingCardType =
  (typeof LISTING_CARD_TYPES)[keyof typeof LISTING_CARD_TYPES];
export interface ListingItem {
  name: string;
  subTitle: string;
  price: number | string;
  isNegative?: boolean;
  imgSrc?: string;
  icon?: ReactNode;
  display?: GraphicsType;
}

export type ListingCardConfigType = {
  title: string;
  subtitle?: string;
  options: ListingOptionType[];
  items: ListingItem[];
};
