import RentalIncomeDetailsContent from "./RentalIncomeDetailsContent";

const RentalIncomeDetailsPage = async ({
  params,
}: {
  params: Promise<{ rentalIncomeId: string }>;
}) => {
  const { rentalIncomeId } = await params;
  return <RentalIncomeDetailsContent rentalIncomeId={rentalIncomeId} />;
};

export default RentalIncomeDetailsPage;
