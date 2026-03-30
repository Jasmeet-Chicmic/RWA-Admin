import { getOrganisationProfileAction } from "@/api/organizations";
import ErrorState from "@/components/atoms/ErrorState";
import { LOGIN_ROLE } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OrganisationPropertiesTable from "../../properties/organisations/[organisationId]/OrganisationPropertiesTable";

const OrganisationPropertiesPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) => {
  try {
    const resolvedSearchParams = await searchParams;
    console.log(
      "OrganisationPropertiesPage searchParams resolved",
      resolvedSearchParams,
    );

    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get("session")?.value);
    const role = session?.role;

    // Admin must not access organisation-only properties route.
    if (role !== LOGIN_ROLE.ORGANISATION) {
      redirect(ROUTES.DASHBOARD_ANALYTICS);
    }

    const profileRes = await getOrganisationProfileAction();
    const organisationId = profileRes?.data?.id as string | undefined;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <OrganisationPropertiesTable organisationId={organisationId ?? ""} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching organisation properties:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationPropertiesPage;
