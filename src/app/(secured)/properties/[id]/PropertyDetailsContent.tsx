"use client";

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import Breadcrumbs, { BreadcrumbItem } from "@/components/atoms/Breadcrumbs";
import {
  PROPERTY_DOCUMENT_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/constants/properties";
import { PRIVATE_ROUTES } from "@/shared/routes";
import { buildAssetsUrl } from "@/shared/utils";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPropertyDetails } from "@/store/propertiesSlice";
import { fetchTransactionsList } from "@/store/transactionsSlice";
import TransactionsTable from "@/app/(secured)/transactions/list/TransactionsTable";
import PropertyDetailsContentSkeleton from "./PropertyDetailsContentSkeleton";

const StatItem = ({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="flex flex-col gap-2 md:gap-3">
    <span className="font-roboto text-xs md:text-sm font-normal text-white">
      {label}
    </span>
    <span
      className={`font-roboto text-xl md:text-[30px] leading-tight font-bold ${valueClassName}`}
    >
      {value}
    </span>
  </div>
);

const PropertyDetailsContent = ({
  propertyId,
  detailsScope = "admin",
}: {
  propertyId: string;
  detailsScope?: "admin" | "organisation";
}) => {
  const t = useTranslations("properties");
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const dispatch = useAppDispatch();
  const lastRequestedPropertyIdRef = useRef<string | null>(null);
  const { item, isLoading, error } = useAppSelector(
    (state) => state.properties.details,
  );

  const {
    items: propertyTransactions,
    totalCount: propertyTransactionsTotalCount,
    isLoading: propertyTransactionsLoading,
  } = useAppSelector((state) => state.transactions.list);

  const lastRequestedTransactionsPropertyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastRequestedPropertyIdRef.current === propertyId) return;
    lastRequestedPropertyIdRef.current = propertyId;
    dispatch(fetchPropertyDetails({ propertyId, scope: detailsScope }));
  }, [detailsScope, dispatch, propertyId]);

  useEffect(() => {
    if (lastRequestedTransactionsPropertyIdRef.current === propertyId) return;
    lastRequestedTransactionsPropertyIdRef.current = propertyId;
    dispatch(
      fetchTransactionsList({
        propertyId,
        page: 1,
        pageSize: 10,
      }),
    );
  }, [dispatch, propertyId]);

  if (isLoading) {
    return <PropertyDetailsContentSkeleton />;
  }

  if (error || !item) {
    return (
      <div className="w-full !pt-0 py-8 lg:py-12">
        <div className="w-full max-w-[1260px] min-[1680px]:max-w-[1480px] px-[20px] mx-auto">
          <div className="rounded-[11.57px] border border-[#292929] bg-[#141414] p-6 text-white">
            <h1 className="text-xl font-semibold">{t("propertyDetails")}</h1>
            <p className="mt-2 text-sm text-red-400">
              {error || t("propertyDetailsFetchError")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status = item.status as keyof typeof PROPERTY_STATUS_LABELS;
  const statusLabel = PROPERTY_STATUS_LABELS[status] ?? String(item.status);
  const typeLabel =
    PROPERTY_TYPE_LABELS[
      item.propertyType as keyof typeof PROPERTY_TYPE_LABELS
    ] || String(item.propertyType);
  const propertyImages = item.imageUrls || [];
  const documents = item.documents || [];
  const adminDocuments = item.adminDocuments || [];
  const activeImage =
    propertyImages.length > 0
      ? buildAssetsUrl(propertyImages[activeImageIndex % propertyImages.length])
      : "";
  const breadcrumbItems: BreadcrumbItem[] =
    detailsScope === "organisation"
      ? [
          { label: t("organisations"), href: PRIVATE_ROUTES.ORGANISATIONS },
          {
            label: t("properties"),
            href: PRIVATE_ROUTES.ORGANISATIONS_PROPERTIES,
          },
          { label: t("propertyDetails") },
        ]
      : [
          { label: t("properties"), href: PRIVATE_ROUTES.PROPERTIES },
          { label: t("propertyDetails") },
        ];

  const valuation = formatDisplayCurrency(
    fromBaseUnits(item.approvedValuation),
  );
  const sharePrice =
    item.pricePerShare == null
      ? "-"
      : formatDisplayCurrency(fromBaseUnits(item.pricePerShare));
  const isListedOrSoldOut =
    Number(item.status) === 4 || Number(item.status) === 5;
  const annualYield =
    item.annualYieldPercentage == null ? "-" : `${item.annualYieldPercentage}%`;
  const listedPercent =
    item.sellingPercentage == null ? "-" : `${item.sellingPercentage}%`;
  const hasMultipleImages = propertyImages.length > 1;

  const handlePrevImage = () => {
    if (!propertyImages.length) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? propertyImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    if (!propertyImages.length) return;
    setActiveImageIndex((prev) =>
      prev === propertyImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="w-full !pt-0 py-8 lg:py-12">
      <div className="w-full max-w-[1260px] min-[1680px]:max-w-[1480px] px-[20px] mx-auto">
        <div className="flex flex-col gap-6 md:gap-[37px] w-full text-white">
          <Breadcrumbs
            id={`property-details-breadcrumbs-${propertyId}`}
            items={breadcrumbItems}
            ariaLabel={t("propertyDetails")}
          />

          <div className="w-full h-[250px] sm:h-[350px] md:h-[444px] rounded-[11.57px] overflow-hidden border border-[#292929] bg-[#141414] relative">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={item.name || t("images")}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-white/60">
                {t("noImagesAvailable")}
              </div>
            )}
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#C7FE1E] text-black flex items-center justify-center hover:brightness-95 transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#C7FE1E] text-black flex items-center justify-center hover:brightness-95 transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {propertyImages.map((_, index) => (
                    <button
                      key={`image-dot-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Go to image ${index + 1}`}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeImageIndex
                          ? "w-6 bg-[#C7FE1E]"
                          : "w-2.5 bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 md:gap-[18.5px]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
              <div className="flex flex-col gap-2">
                <h1 className="font-roboto text-2xl md:text-[30px] md:leading-[38px] font-bold capitalize">
                  {item.name || "—"}
                </h1>
                <div className="flex items-center gap-[9px]">
                  <MapPin size={20} className="text-[#C7FE1E]" />
                  <span className="font-roboto text-sm md:text-lg font-normal capitalize">
                    {item.location || "—"}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center border-none rounded-[33px] px-3 py-1 text-[12px] font-bold bg-[#00A63E] text-white">
                {statusLabel}
              </span>
            </div>

            {item.rejectionReason && (
              <div className="flex flex-col items-start gap-2 bg-red-500/10 px-[22.7px] py-[11px] rounded-[11.57px] border border-red-500/20 w-full">
                <span className="text-[#ff3b3b] font-roboto text-base font-medium">
                  Rejection Reason:
                </span>
                <span className="text-[#cc5555] font-roboto text-sm md:text-base font-normal">
                  {item.rejectionReason}
                </span>
              </div>
            )}

            {item.approvedReason && (
              <div className="flex flex-col items-start gap-2 bg-emerald-500/10 px-[22.7px] py-[11px] rounded-[11.57px] border border-emerald-500/20 w-full">
                <span className="text-emerald-400 font-roboto text-base font-medium">
                  Approval Notes:
                </span>
                <span className="text-emerald-300 font-roboto text-sm md:text-base font-normal">
                  {item.approvedReason}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-[22px] p-6 md:p-[27.77px] bg-[#141414] border border-[#292929] rounded-[11.57px]">
            <StatItem label="Total Value" value={valuation} />
            <StatItem
              label="Price/Share"
              value={isListedOrSoldOut ? sharePrice : "-"}
            />
            <StatItem
              label="Annual Yield"
              value={isListedOrSoldOut ? annualYield : "-"}
              valueClassName={
                isListedOrSoldOut ? "text-[#00A63E]" : "text-white"
              }
            />
            <StatItem
              label="Rental Income History"
              value={
                isListedOrSoldOut && item.rentalIncomeHistory != null
                  ? String(item.rentalIncomeHistory)
                  : "-"
              }
            />
            <StatItem
              label="Property Size"
              value={
                item.squareFeet != null
                  ? `${item.squareFeet.toLocaleString()} sq ft`
                  : "-"
              }
            />
            <StatItem label="Listed %" value={listedPercent} />
          </div>

          <div className="flex flex-col gap-4 md:gap-[18.5px]">
            <h3 className="font-roboto text-lg md:text-[22px] md:leading-[28px] font-semibold">
              Property Highlights
            </h3>
            <div className="flex flex-col gap-1 md:gap-[12px]">
              <p className="font-inter text-sm md:text-base font-normal capitalize">
                • {typeLabel} property in {item.location || "—"}
              </p>
              <p className="font-inter text-sm md:text-base font-normal capitalize">
                • Approx. {(item.squareFeet ?? 0).toLocaleString()} sq ft,{" "}
                {listedPercent} listed for sale
              </p>
              <p className="font-inter text-sm md:text-base font-normal">
                • {item.description || "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-[18.5px]">
            <button
              type="button"
              onClick={() => setIsDocumentsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between p-4 bg-[#141414] border border-[#292929] rounded-[11.57px] hover:bg-white/5 transition-colors"
            >
              <h3 className="font-roboto text-lg md:text-[22px] md:leading-[28px] font-semibold text-left">
                Property Documents
              </h3>
              <span className="text-sm text-white/70">
                {isDocumentsExpanded ? "Collapse -" : "Expand +"}
              </span>
            </button>

            {isDocumentsExpanded &&
              (documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <a
                      key={doc.id || doc.documentUrl}
                      href={buildAssetsUrl(doc.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-[#292929] p-4 bg-[#141414] hover:bg-white/5 transition-colors"
                    >
                      <p className="text-[14px] text-white font-medium truncate">
                        {doc.fileName}
                      </p>
                      <p className="mt-1 text-[12px] text-white/60">
                        {typeof doc.type === "number"
                          ? (PROPERTY_DOCUMENT_TYPE_LABELS[doc.type] ??
                            t("document"))
                          : t("document")}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-white/60">{t("noDocumentsAvailable")}</div>
              ))}
          </div>

          {adminDocuments.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-roboto text-lg md:text-[22px] md:leading-[28px] font-semibold">
                Admin Documents
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adminDocuments.map((doc) => (
                  <a
                    key={doc.id || doc.documentUrl}
                    href={buildAssetsUrl(doc.documentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#292929] p-4 bg-[#141414] hover:bg-white/5 transition-colors"
                  >
                    <p className="text-[14px] text-white font-medium truncate">
                      {doc.fileName}
                    </p>
                    <p className="mt-1 text-[12px] text-white/60">
                      {typeof doc.type === "number"
                        ? (PROPERTY_DOCUMENT_TYPE_LABELS[doc.type] ??
                          t("document"))
                        : t("document")}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="pt-10">
            <TransactionsTable
              data={propertyTransactions}
              totalCount={propertyTransactionsTotalCount}
              isLoading={propertyTransactionsLoading}
              hidePropertiesColumn
              showFilters={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsContent;
