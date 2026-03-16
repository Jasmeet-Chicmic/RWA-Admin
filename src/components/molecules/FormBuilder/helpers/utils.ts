export const getRequiredFieldMessage = (
  fieldName: string,
  t?: (key: string, values?: Record<string, string>) => string,
) => {
  if (t) {
    return t("{field} is required", { field: fieldName });
  }
  return `${fieldName} is required`;
};
