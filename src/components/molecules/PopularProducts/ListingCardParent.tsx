import { getRequest } from "@/shared/fetcher";
import { LISTING_OPTION_VALUES, LISTING_OPTIONS } from "./helpers/types";
import { GetParamsType } from "@/shared/types";

import ListingCard from "../ListingCard";
import { LISTING_CARD_TYPES, ListingItem } from "../ListingCard/helpers/types";

const ListingCardParent = async ({
  filterType,
  endpoint,
}: {
  filterType: LISTING_OPTION_VALUES;
  endpoint: string;
}) => {
  const data = await getRequest<
    ResponseType & { data: { data: ListingItem[] } },
    GetParamsType
  >(endpoint, {
    filterType: filterType || LISTING_OPTION_VALUES.THIS_WEEK,
    limit: 10,
  });

  return (
    <div>
      <ListingCard
        title="Top Transactions"
        subtitle="Recent orders"
        data={data?.data?.data || []}
        menuOptions={LISTING_OPTIONS}
        listingCardType={LISTING_CARD_TYPES.TRANSACTION}
      />

      {/* <ListingCard
        title={transactionData.title}
        subtitle={transactionData.subtitle}
        menu={
          <DropdownMenu
            options={transactionData.options}
            onSelect={(opt) => console.log("Selected:", opt)}
          />
        }
        data={transactionData.items}
      /> */}
    </div>
  );
};

export default ListingCardParent;
