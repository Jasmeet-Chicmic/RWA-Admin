import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { API_END_POINTS } from "@/shared/api";
import { USER_ACTIVITY_TYPE, UserActivityTypeText } from "@/shared/constants";
import { getRequest } from "@/shared/fetcher";
import { GetParamsType, UserActivity } from "@/shared/types";
import { FileText } from "lucide-react";
import { getRelativeTime } from "@/shared/utils";
import { format } from "date-fns";

const UserActivty = async ({ userId }: { userId: string }) => {
  const data = await getRequest<
    ResponseType & { data: { data: UserActivity[]; count: number } },
    GetParamsType
  >(API_END_POINTS.USER_ACTIVITY, {
    userId,
  });

  return (
    <div className="bg-bgwhite rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">User Activity Timeline</h2>
      <div className="space-y-10">
        {data?.data?.data.map((activity) => {
          return (
            <div key={activity._id} className="relative pl-6">
              <div className="absolute left-0 top-1.5">
                <span className={`w-3 h-3 rounded-full block bg-gray-400`} />
              </div>

              <div>
                <h5 className="font-semibold flex items-center gap-2">
                  {/* <FileText className="w-4 h-4 text-muted" /> */}
                  {UserActivityTypeText[activity.type].title}
                </h5>
                <p className="text-sm text-gray-500">
                  {UserActivityTypeText[activity.type].subtitle(
                    activity.type === USER_ACTIVITY_TYPE.CLIENT_MEETING
                      ? format(activity.createdAt, "HH:mm a")
                      : activity.type === USER_ACTIVITY_TYPE.PROJECT_CREATED
                        ? String(activity?.teamMembers?.length) || ""
                        : "",
                  )}
                </p>

                {activity.type === USER_ACTIVITY_TYPE.INVOICE_PAID && (
                  <button className="flex items-center gap-2 bg-gray-100 text-sm px-3 py-1 rounded mt-2 hover:bg-gray-200">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>Invoice</span>
                  </button>
                )}

                {activity.type === USER_ACTIVITY_TYPE.CLIENT_MEETING && (
                  <div className="flex items-center gap-3 mt-3">
                    <Avatar>
                      <AvatarImage
                        src={activity?.client?.profilePicture || ""}
                      />
                      <AvatarFallback>
                        {activity?.client?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.client?.name}
                      </p>
                      {/* <p className="text-[0.875rem] text-sidebartext">
                        {activity.user.role}
                      </p> */}
                    </div>
                  </div>
                )}

                {activity.type === USER_ACTIVITY_TYPE.PROJECT_CREATED &&
                  activity.teamMembers && (
                    <div className="flex items-center space-x-[-8px] mt-3">
                      {activity.teamMembers?.slice(0, 3).map((item, idx) => (
                        <Avatar
                          key={idx}
                          className="w-8 h-8 border-2 borderbgwhite"
                        >
                          <AvatarImage src={item?.profilePicture} />
                          <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {activity.teamMembers?.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-sm flex items-center justify-center border-2 borderbgwhite">
                          +{activity.teamMembers?.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                <p className="text-[0.875] bordercolor1 mt-1">
                  {getRelativeTime(activity.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default UserActivty;
