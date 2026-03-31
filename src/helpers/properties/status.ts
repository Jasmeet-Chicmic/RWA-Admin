import {
  PROPERTY_STATUS_LABEL_MAP,
  PropertyStatus,
} from "@/constants/properties";

export const getPropertyStatusTranslationKey = (
  status: PropertyStatus | number | string,
): string => {
  const label = PROPERTY_STATUS_LABEL_MAP[status] ?? String(status);

  const normalizedLabel =
    label === "Listed" ? "Active" : label.replace(/\s+/g, "");

  return `Status.${normalizedLabel}`;
};

export const getPropertyStatusBadgeClassName = (
  status: PropertyStatus,
): string => {
  switch (status) {
    case PropertyStatus.Active:
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case PropertyStatus.Draft:
      return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700";
    case PropertyStatus.AdminApproved:
      return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800";
    case PropertyStatus.OrganizationAssigned:
      return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800";
    case PropertyStatus.SoldOut:
      return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";
    case PropertyStatus.Rejected:
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case PropertyStatus.ModificationRequired:
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
    case PropertyStatus.PendingApproval:
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  }
};
