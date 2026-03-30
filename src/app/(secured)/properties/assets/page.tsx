import AllPropertiesTable from "@/components/properties/AllPropertiesTable";
import { PropertyStatus } from "../helpers/types";

const Page = () => (
  <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
    <AllPropertiesTable
      fixedStatus={PropertyStatus.AdminApproved}
      hideStatusFilter
    />
  </div>
);

export default Page;
