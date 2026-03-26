import ErrorState from "@/components/atoms/ErrorState";
import { getAllPropertiesAction } from "@/api/allPropertiesActions";
import { DEFAULT_PAGE_SIZE } from "./helpers/propertiesConstants";
import AllPropertiesTable from "./AllPropertiesTable";

const Page = async () => {
  try {
    const res = await getAllPropertiesAction({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });

    const items = res?.items ?? [];
    const totalCount = res?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <AllPropertiesTable
          initialData={items}
          initialTotalCount={totalCount}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching properties:", error);
    return <ErrorState title="properties" />;
  }
};

export default Page;
