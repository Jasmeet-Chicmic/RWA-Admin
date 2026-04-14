import { Suspense } from "react";
import NotificationsListContainer from "./NotificationsListContainer";
import Loader from "@/components/atoms/Loader/Loader";

const NotificationsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-20">
          <Loader />
        </div>
      }
    >
      <NotificationsListContainer />
    </Suspense>
  );
};

export default NotificationsPage;
