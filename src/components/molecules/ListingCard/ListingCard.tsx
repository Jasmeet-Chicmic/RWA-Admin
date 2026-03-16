"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

import DropdownMenu from "@/components/atoms/DropdownMenu"; // Assuming this is the interactive component
import { ListingOptionType } from "@/components/atoms/DropdownMenu/utils/types";
import ListingCardItem from "@/components/atoms/ListingCardItem";

import { ListingCardType, ListingItem } from "./helpers/types";

export interface ListingCardProps {
  title: string;
  subtitle?: string;
  data: ListingItem[];
  listingCardType: ListingCardType;
  // Change this:
  // menu?: ReactNode;

  // To this:
  menuOptions?: ListingOptionType[];
  customMenu?: ReactNode; // optional override if needed
  filterKeyName?: string;
}

const ListingCard = ({
  title,
  subtitle,
  data,
  menuOptions,
  customMenu,
  listingCardType,
  filterKeyName = "filterType",
}: ListingCardProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const newParams = new URLSearchParams(searchParams.toString());
  const onSelectItem = (value: number) => {
    newParams.set(filterKeyName, value.toString());
    router.push(`?${newParams.toString()}`);
  };
  return (
    <div className="bg-bgwhite rounded-[5px] shadow-customsm w-full flex flex-col p-[25px] dark:bg-darkbgprimary">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-title text-gray-800 dark:bordercolor1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-subtitle text-gray-500 dark:bordercolor1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Menu dropdown */}
        <div className="relative">
          {customMenu ? (
            customMenu
          ) : menuOptions?.length ? (
            <DropdownMenu options={menuOptions} onSelect={onSelectItem} />
          ) : null}
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <ListingCardItem
            key={`${item?.name + index}`}
            item={item}
            listingCardType={listingCardType}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingCard;
