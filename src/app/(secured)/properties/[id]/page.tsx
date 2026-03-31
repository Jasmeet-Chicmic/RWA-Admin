import PropertyDetailsContent from "./PropertyDetailsContent";

const PropertyDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  return <PropertyDetailsContent propertyId={id} detailsScope="admin" />;
};

export default PropertyDetailsPage;
