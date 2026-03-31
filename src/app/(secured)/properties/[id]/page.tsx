import { getTranslations } from "next-intl/server";

const PropertyDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const t = await getTranslations("properties");

  return (
    <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
      <h1 className="text-xl font-semibold text-textprimary dark:text-sidebartext">
        {t("propertyDetails")}
      </h1>
      <p className="mt-2 text-sm text-textparagraph dark:text-textparagraphlight">
        {t("propertyDetailsPlaceholder", { id })}
      </p>
    </div>
  );
};

export default PropertyDetailsPage;
