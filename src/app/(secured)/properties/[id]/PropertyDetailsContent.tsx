"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import Breadcrumbs, { BreadcrumbItem } from "@/components/atoms/Breadcrumbs";
import {
  PROPERTY_DOCUMENT_TYPE_LABELS,
  PROPERTY_STATUS_BADGE_CLASSES,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
} from "@/constants/properties";
import { PRIVATE_ROUTES } from "@/shared/routes";
import { buildAssetsUrl } from "@/shared/utils";
import { formatDisplayCurrency, fromBaseUnits } from "@/shared/utils/unitUtils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPropertyDetails } from "@/store/propertiesSlice";

const PropertyDetailsContent = ({
  propertyId,
  detailsScope = "admin",
}: {
  propertyId: string;
  detailsScope?: "admin" | "organisation";
}) => {
  const t = useTranslations("properties");
  const dispatch = useAppDispatch();
  const lastRequestedPropertyIdRef = useRef<string | null>(null);
  const { item, isLoading, error } = useAppSelector(
    (state) => state.properties.details,
  );

  useEffect(() => {
    if (lastRequestedPropertyIdRef.current === propertyId) return;
    lastRequestedPropertyIdRef.current = propertyId;
    dispatch(fetchPropertyDetails({ propertyId, scope: detailsScope }));
  }, [detailsScope, dispatch, propertyId]);

  if (isLoading) {
    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
        <h1 className="text-xl font-semibold text-textprimary dark:text-sidebartext">
          {t("propertyDetails")}
        </h1>
        <p className="mt-2 text-sm text-textparagraph dark:text-textparagraphlight">
          {t("loadingPropertyDetails")}
        </p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-0 mt-[20px] bg-white dark:bg-darkbgbase p-6 rounded-xl">
        <h1 className="text-xl font-semibold text-textprimary dark:text-sidebartext">
          {t("propertyDetails")}
        </h1>
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">
          {error || t("propertyDetailsFetchError")}
        </p>
      </div>
    );
  }

  const status = item.status as keyof typeof PROPERTY_STATUS_LABELS;
  const statusClass =
    PROPERTY_STATUS_BADGE_CLASSES[status] ||
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  const statusLabel = PROPERTY_STATUS_LABELS[status] ?? String(item.status);
  const typeLabel =
    PROPERTY_TYPE_LABELS[
      item.propertyType as keyof typeof PROPERTY_TYPE_LABELS
    ] || String(item.propertyType);
  const propertyImages = item.imageUrls || [];
  const documents = item.documents || [];
  const adminDocuments = item.adminDocuments || [];
  const coverImage = buildAssetsUrl(propertyImages[0]);
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
    item.pricePerShare === null
      ? "—"
      : formatDisplayCurrency(fromBaseUnits(item.pricePerShare));

  return (
    <div className="space-y-6 mt-[20px] rounded-2xl bg-white dark:bg-darkbgbase p-6 lg:p-8">
      <Breadcrumbs
        id={`property-details-breadcrumbs-${propertyId}`}
        items={breadcrumbItems}
        ariaLabel={t("propertyDetails")}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-textparagraph dark:text-textparagraphlight">
            {t("propertyDetails")}
          </p>
          <h1 className="mt-2 text-3xl lg:text-4xl font-semibold text-textprimary dark:text-sidebartext">
            {item.name || "—"}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-textparagraph dark:text-textparagraphlight">
            <MapPin size={14} />
            <span>{item.location || "—"}</span>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-2xl overflow-hidden border border-bordercolor1 dark:border-darkbordercolor1 min-h-[260px] bg-black/5 dark:bg-black/20">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={item.name || t("images")}
              width={1200}
              height={800}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full min-h-[260px] flex items-center justify-center text-sm text-textparagraph dark:text-textparagraphlight">
              {t("noImagesAvailable")}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
              {t("approvedValuation")}
            </p>
            <p className="mt-2 text-xl font-semibold text-textprimary dark:text-sidebartext">
              {valuation}
            </p>
          </div>
          <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
              {t("pricePerShare")}
            </p>
            <p className="mt-2 text-xl font-semibold text-primarycolor">
              {sharePrice}
            </p>
          </div>
          <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
              {t("squareFeet")}
            </p>
            <p className="mt-2 text-xl font-semibold text-textprimary dark:text-sidebartext">
              {item.squareFeet ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
              {t("sellingPercentage")}
            </p>
            <p className="mt-2 text-xl font-semibold text-primarycolor">
              {item.sellingPercentage === null
                ? "—"
                : `${item.sellingPercentage}%`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4 lg:p-5">
          <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
            {t("description")}
          </p>
          <p className="mt-3 text-sm leading-6 text-textprimary dark:text-sidebartext">
            {item.description || "—"}
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 p-3">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("propertyType")}
              </p>
              <p className="mt-1 text-textprimary dark:text-sidebartext">
                {typeLabel}
              </p>
            </div>
            <div className="rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 p-3">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("annualYield")}
              </p>
              <p className="mt-1 text-textprimary dark:text-sidebartext">
                {item.annualYieldPercentage === null
                  ? "—"
                  : `${item.annualYieldPercentage}%`}
              </p>
            </div>
            <div className="rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 p-3">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("rejectionReason")}
              </p>
              <p className="mt-1 text-textprimary dark:text-sidebartext">
                {item.rejectionReason || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 p-3">
              <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                {t("approvalReason")}
              </p>
              <p className="mt-1 text-textprimary dark:text-sidebartext">
                {item.approvedReason || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
              {t("documents")}
            </p>
            {documents.length === 0 ? (
              <p className="mt-2 text-sm text-textparagraph dark:text-textparagraphlight">
                {t("noDocumentsAvailable")}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id || doc.documentUrl}
                    className="rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 p-3"
                  >
                    <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                      {typeof doc.type === "number"
                        ? (PROPERTY_DOCUMENT_TYPE_LABELS[doc.type] ??
                          t("document"))
                        : t("document")}
                    </p>
                    <a
                      href={buildAssetsUrl(doc.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-sm text-primarycolor underline break-all"
                    >
                      {doc.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-bordercolor1 dark:border-darkbordercolor1 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-textparagraph dark:text-textparagraphlight">
              {t("adminDocuments")}
            </p>
            {adminDocuments.length === 0 ? (
              <p className="mt-2 text-sm text-textparagraph dark:text-textparagraphlight">
                {t("noAdminDocumentsAvailable")}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {adminDocuments.map((doc) => (
                  <li
                    key={doc.id || doc.documentUrl}
                    className="rounded-lg border border-bordercolor1 dark:border-darkbordercolor1 p-3"
                  >
                    <p className="text-xs text-textparagraph dark:text-textparagraphlight">
                      {typeof doc.type === "number"
                        ? (PROPERTY_DOCUMENT_TYPE_LABELS[doc.type] ??
                          t("document"))
                        : t("document")}
                    </p>
                    <a
                      href={buildAssetsUrl(doc.documentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-sm text-primarycolor underline break-all"
                    >
                      {doc.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsContent;
