import AllPropertiesTable from "@/components/properties/AllPropertiesTable";
import { PropertyStatus } from "@/constants/properties";

const Page = () => (
  <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
    <AllPropertiesTable
      fixedStatus={PropertyStatus.Rejected}
      hideStatusFilter
    />
  </div>
);

export default Page;
