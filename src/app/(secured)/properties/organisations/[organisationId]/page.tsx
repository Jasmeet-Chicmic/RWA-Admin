import OrganisationPropertiesTable from "./OrganisationPropertiesTable";
const OrganisationPropertiesPage = async ({
  params,
}: {
  params: Promise<{ organisationId: string }>;
}) => {
  const { organisationId } = await params;
  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase">
      <div className="overflow-x-auto">
        <OrganisationPropertiesTable
          organisationId={organisationId}
          hideActions={true}
        />
      </div>
    </div>
  );
};

export default OrganisationPropertiesPage;
