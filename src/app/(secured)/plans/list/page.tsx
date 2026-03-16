import { getPlansAction } from "@/api/adminPlans";
import { Plan } from "@/shared/types";
import PlansView from "./PlansView";
import ErrorState from "@/components/atoms/ErrorState";

const PlansPage = async () => {
  try {
    const res = await getPlansAction();
    const plans: Plan[] = res?.data ?? [];

    return (
      <div className="space-y-0 mt-[20px]">
        <PlansView plans={plans} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching plans:", error);
    return <ErrorState title="plans" />;
  }
};

export default PlansPage;
