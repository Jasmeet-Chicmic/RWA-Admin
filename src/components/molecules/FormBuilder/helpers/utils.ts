export const getRequiredFieldMessage = (
  fieldName: string,
  t?: (key: string, values?: Record<string, string>) => string,
) => {
  if (t) {
    return t("fieldIsRequired", { field: fieldName });
  }
  return `${fieldName} is required`;
};
