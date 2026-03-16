import { getPointRulesAction, PointRule } from "@/api/config";
import PointRulesTable from "../list/PointRulesTable";

const PointRulesPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  // Await searchParams to make page dynamic (even if not used)
  await searchParams;
  let pointRulesData: PointRule[] = [];

  try {
    const response = await getPointRulesAction();
    pointRulesData = response?.data || [];
  } catch (error) {
    console.error("Error fetching point rules:", error);
  }

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <PointRulesTable pointRules={pointRulesData} />
    </div>
  );
};

export default PointRulesPage;
