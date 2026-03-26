import ErrorState from "@/components/atoms/ErrorState";
import OrganisationsTable, { OrganisationRow } from "./OrganisationsTable";
import OrganisationPropertiesTable from "../properties/organisations/[organisationId]/OrganisationPropertiesTable";
import {
  getAdminOrganisationsAction,
  getOrganisationPropertiesAction,
  AdminOrganisation,
} from "@/api/adminOrganisations";
import { getOrganisationProfileAction } from "@/api/organizations";
import { LOGIN_ROLE } from "@/shared/constants";
import { decrypt } from "@/shared/session";
import { cookies } from "next/headers";

const DEFAULT_PAGE_SIZE = 10;

const OrganisationsPage = async ({
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

    // Organisation login: show only the organisation's own properties table.
    if (role === LOGIN_ROLE.ORGANISATION) {
      const profileRes = await getOrganisationProfileAction();
      const organisationId = profileRes?.data?.id as string | undefined;

      if (!organisationId) {
        throw new Error("Organisation id missing from profile response");
      }

      const propertiesRes = await getOrganisationPropertiesAction({
        organisationId,
        page: pageNumber,
        pageSize,
      });

      const items = propertiesRes?.items ?? [];
      const totalCount = propertiesRes?.totalCount ?? items.length;

      return (
        <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
          <div className="overflow-x-auto">
            <OrganisationPropertiesTable
              data={items}
              totalCount={totalCount}
              organisationId={organisationId}
            />
          </div>
        </div>
      );
    }

    // Admin login: keep existing organisations list behavior.
    const res = await getAdminOrganisationsAction({
      page: pageNumber,
      pageSize,
    });

    const items = res?.data?.items ?? [];
    const totalCount = res?.data?.totalCount ?? items.length;

    const organisations: OrganisationRow[] = items.map(
      (org: AdminOrganisation) => ({
        id: org.id,
        name: org.name,
        walletAddress: org.walletAddress,
        entityType: org.entityType,
        registrationNumber: org.registrationNumber,
        jurisdiction: org.jurisdiction,
        incorporationDate: org.incorporationDate,
        status: org.status,
        propertyHolds: org.propertyHolds,
      }),
    );

    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
        <div className="overflow-x-auto">
          <OrganisationsTable data={organisations} totalCount={totalCount} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading organisations:", error);
    return <ErrorState title="properties" />;
  }
};

export default OrganisationsPage;
