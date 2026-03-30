"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import SelectFilter from "@/components/atoms/SelectFilter";
import { GROUP_TYPE } from "../helpers/types";

const GroupFilters = () => {
  const t = useTranslations("groups");

  const typeOptions = useMemo(
    () => [
      { label: t("public"), value: String(GROUP_TYPE.PUBLIC) },
      { label: t("private"), value: String(GROUP_TYPE.PRIVATE) },
      { label: t("secret"), value: String(GROUP_TYPE.SECRET) },
    ],
    [t],
  );

  const closedOptions = useMemo(
    () => [
      { label: t("closed"), value: "true" },
      { label: t("open"), value: "false" },
    ],
    [t],
  );

  const draftOptions = useMemo(
    () => [
      { label: t("draft"), value: "true" },
      { label: t("published"), value: "false" },
    ],
    [t],
  );

  const activeOptions = useMemo(
    () => [
      { label: t("active"), value: "true" },
      { label: t("inactive"), value: "false" },
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
          {t("type")}
        </label>
        <SelectFilter
          id="type-filter"
          paramName="type"
          options={typeOptions}
          placeholder={t("selectType")}
        />
      </div>

      <div>
        <label
          htmlFor="is-closed-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("isClosed")}
        </label>
        <SelectFilter
          id="is-closed-filter"
          paramName="isClosed"
          options={closedOptions}
          placeholder={t("selectClosedStatus")}
        />
      </div>

      <div>
        <label
          htmlFor="is-draft-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("isDraft")}
        </label>
        <SelectFilter
          id="is-draft-filter"
          paramName="isDraft"
          options={draftOptions}
          placeholder={t("selectDraftStatus")}
        />
      </div>

      <div>
        <label
          htmlFor="is-active-filter"
          className="block text-sm font-medium text-labelprimary dark:text-darklabelprimary mb-2"
        >
          {t("isActive")}
        </label>
        <SelectFilter
          id="is-active-filter"
          paramName="isActive"
          options={activeOptions}
          placeholder={t("selectActiveStatus")}
        />
      </div>
    </div>
  );
};

export default GroupFilters;
