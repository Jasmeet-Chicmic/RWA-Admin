// hooks/useTranslatedStrings.ts
import { STRING, StringKey } from "@/shared/strings";
import { useTranslations } from "next-intl";

export const useTranslatedStrings = (group: string) => {
  const t = useTranslations(group);

  const translated = new Proxy(STRING, {
    get(_, prop: string) {
      if (prop in STRING) {
        return t(STRING[prop as StringKey]);
      }
      return prop;
    },
  });

  return translated as typeof STRING;
};
