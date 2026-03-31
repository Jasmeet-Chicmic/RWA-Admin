import PropertyDetailsContent from "@/app/(secured)/properties/[id]/PropertyDetailsContent";

const OrganisationPropertyDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <PropertyDetailsContent propertyId={id} detailsScope="organisation" />;
};

export default OrganisationPropertyDetailsPage;
