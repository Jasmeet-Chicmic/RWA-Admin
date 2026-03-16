import { getTranslations } from "next-intl/server";

import { getAdminSubscriptionsAction } from "@/api/adminSubscriptions";
import { Subscription } from "@/shared/types";
import UserSubscriptionCard from "./UserSubscriptionsTable";
import ErrorState from "@/components/atoms/ErrorState";

const UserSubscriptionsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const tUsers = await getTranslations("users");

  try {
    const res = await getAdminSubscriptionsAction({
      ownerId: id,
      pageNumber: 1,
      pageSize: 10,
    });

    const subscriptions: Subscription[] = res?.data?.items ?? [];

    return (
      <div className="space-y-6">
        <UserSubscriptionCard subscriptions={subscriptions} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return <ErrorState title={tUsers("Subscription")} />;
  }
};

export default UserSubscriptionsPage;
