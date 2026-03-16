"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

import { dummyLogo } from "@/assets";
import {
  GRAPHICS_TYPES,
  LISTING_CARD_TYPES,
  ListingCardType,
  ListingItem,
} from "@/components/molecules/ListingCard/helpers/types";

interface ListingCardItemProps {
  item: ListingItem;
  listingCardType: ListingCardType;
}

const ListingCardItem = ({ item, listingCardType }: ListingCardItemProps) => {
  return (
    <div className="flex items-center">
      {/* Icon or Image */}
      {item.display === GRAPHICS_TYPES.IMAGE ? (
        <Image
          src={item.imgSrc || dummyLogo}
          alt={item.subTitle}
          width={40}
          height={40}
          className="object-cover self-stretch rounded-1/2"
        />
      ) : (
        item.icon
      )}

      {/* Main Content */}
      <div className="ml-4 flex justify-between items-center w-full flex-wrap gap-y-2">
        {/* Text Section */}
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900 dark:bordercolor1">
            {item.name}
          </p>
          <p className="text-[0.875rem] text-sidebartext dark:bordercolor1">
            {item.subTitle}
          </p>
        </div>

        {/* Trend Section */}
        {listingCardType === LISTING_CARD_TYPES.SALES && (
          <div
            className={`flex items-center text-sm font-medium ${item.isNegative ? "text-red-600" : "text-green-600"} dark:bordercolor1`}
          >
            <span className="mr-1">
              {item.isNegative ? <ChevronDown /> : <ChevronUp />}
            </span>
            {item.price}%
          </div>
        )}

        {listingCardType === LISTING_CARD_TYPES.TRANSACTION && (
          <div
            className={`flex items-center text-sm font-medium ${item.isNegative ? "text-red-600" : "text-green-600"} dark:bordercolor1`}
          >
            {item.isNegative ? "-" : "+"}
            {item.price}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCardItem;
