import ErrorState from "@/components/atoms/ErrorState";
import OrganisationPropertiesTable from "../../properties/organisations/[organisationId]/OrganisationPropertiesTable";
import {
  getOrganisationProfileAction,
  getAuthOrganisationPropertiesAction,
} from "@/api/organizations";
import { LOGIN_ROLE } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_PAGE_SIZE = 10;

const OrganisationPropertiesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    skip?: number;
    limit?: number;
  }>;
}) => {
  try {
    const { skip, limit } = await searchParams;
    const pageSize = limit ? Number(limit) : DEFAULT_PAGE_SIZE;
    const skipNum = skip ? Number(skip) : 0;
    const pageNumber = Math.floor(skipNum / pageSize) + 1;

    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get("session")?.value);
    const role = session?.role;

    // Admin must not access organisation-only properties route.
    if (role !== LOGIN_ROLE.ORGANISATION) {
      redirect(ROUTES.DASHBOARD_ANALYTICS);
    }

    const profileRes = await getOrganisationProfileAction();
    const organisationId = profileRes?.data?.id as string | undefined;

    const propertiesRes = await getAuthOrganisationPropertiesAction({
      page: pageNumber,
      pageSize,
    });

    const items = propertiesRes?.items ?? [];
    const totalCount = propertiesRes?.totalCount ?? items.length;

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
        <div className="overflow-x-auto">
          <OrganisationPropertiesTable
            data={items}
            totalCount={totalCount}
            organisationId={organisationId ?? ""}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching organisation properties:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationPropertiesPage;
