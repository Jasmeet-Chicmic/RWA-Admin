"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import SelectFilter from "@/components/atoms/SelectFilter";
import { GROUP_TYPE } from "../helpers/types";

const GroupFilters = () => {
  const t = useTranslations("groups");

  const typeOptions = useMemo(
    () => [
      { label: t("Public"), value: String(GROUP_TYPE.PUBLIC) },
      { label: t("Private"), value: String(GROUP_TYPE.PRIVATE) },
      { label: t("Secret"), value: String(GROUP_TYPE.SECRET) },
    ],
    [t],
  );

  const closedOptions = useMemo(
    () => [
      { label: t("Closed"), value: "true" },
      { label: t("Open"), value: "false" },
    ],
    [t],
  );

  const draftOptions = useMemo(
    () => [
      { label: t("Draft"), value: "true" },
      { label: t("Published"), value: "false" },
    ],
    [t],
  );

  const activeOptions = useMemo(
    () => [
      { label: t("Active"), value: "true" },
      { label: t("Inactive"), value: "false" },
    ],
    [t],
  );

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="type-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("Type")}
        </label>
        <SelectFilter
          id="type-filter"
          paramName="type"
          options={typeOptions}
          placeholder={t("Select Type")}
        />
      </div>

      <div>
        <label
          htmlFor="is-closed-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("Is Closed")}
        </label>
        <SelectFilter
          id="is-closed-filter"
          paramName="isClosed"
          options={closedOptions}
          placeholder={t("Select Closed Status")}
        />
      </div>

      <div>
        <label
          htmlFor="is-draft-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("Is Draft")}
        </label>
        <SelectFilter
          id="is-draft-filter"
          paramName="isDraft"
          options={draftOptions}
          placeholder={t("Select Draft Status")}
        />
      </div>

      <div>
        <label
          htmlFor="is-active-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("Is Active")}
        </label>
        <SelectFilter
          id="is-active-filter"
          paramName="isActive"
          options={activeOptions}
          placeholder={t("Select Active Status")}
        />
      </div>
    </div>
  );
};

export default GroupFilters;
