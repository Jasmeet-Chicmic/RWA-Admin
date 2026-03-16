import { getRoleFeaturesAction } from "@/api/roles";
import { notFound } from "next/navigation";
import RoleFeaturesTable from "./RoleFeaturesTable";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const res = await getRoleFeaturesAction(id);

  if (!res?.status) {
    return notFound();
  }

  const features = res.data ?? [];

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <RoleFeaturesTable roleId={id} features={features} />
    </div>
  );
};

export default Page;
