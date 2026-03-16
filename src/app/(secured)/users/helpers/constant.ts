import {
  COUNTRIES,
  COUNTRY_NAMES,
  INDUSTRY_SECTOR_NAMES,
  PLAN_NAMES,
  PLAN_TYPE,
  USER_ROLE_NAMES,
  USER_ROLES,
  USER_STATUS,
  USER_STATUS_NAMES,
} from "@/shared/constants";

export const USER_ROLE_OPTIONS = [
  {
    label: USER_ROLE_NAMES[USER_ROLES.ENTERPRISE],
    value: USER_ROLES.ENTERPRISE,
  },
  {
    label: USER_ROLE_NAMES[USER_ROLES.TEAM],
    value: USER_ROLES.TEAM,
  },
  {
    label: USER_ROLE_NAMES[USER_ROLES.MAINTAINER],
    value: USER_ROLES.MAINTAINER,
  },
  {
    label: USER_ROLE_NAMES[USER_ROLES.EDITOR],
    value: USER_ROLES.EDITOR,
  },
  // {
  //   label: USER_ROLE_NAMES[USER_ROLES.SUPER_ADMIN],
  //   value: USER_ROLES.SUPER_ADMIN,
  // },
];
export const USER_PLAN_OPTIONS = [
  {
    label: PLAN_NAMES[PLAN_TYPE.BASIC],
    value: PLAN_TYPE.BASIC,
  },
  {
    label: PLAN_NAMES[PLAN_TYPE.STANDARD],
    value: PLAN_TYPE.STANDARD,
  },
  {
    label: PLAN_NAMES[PLAN_TYPE.PRO],
    value: PLAN_TYPE.PRO,
  },
  {
    label: PLAN_NAMES[PLAN_TYPE.ENTERPRISE],
    value: PLAN_TYPE.ENTERPRISE,
  },
];
export const USER_STATUS_OPTIONS = [
  {
    label: USER_STATUS_NAMES[USER_STATUS.ACTIVE],
    value: USER_STATUS.ACTIVE,
  },
  {
    label: USER_STATUS_NAMES[USER_STATUS.INACTIVE],
    value: USER_STATUS.INACTIVE,
  },
  {
    label: USER_STATUS_NAMES[USER_STATUS.PENDING],
    value: USER_STATUS.PENDING,
  },
];
export const USER_COUNTRY_OPTIONS = [
  { label: COUNTRY_NAMES[COUNTRIES.INDIA], value: COUNTRIES.INDIA },
  { label: COUNTRY_NAMES[COUNTRIES.USA], value: COUNTRIES.USA },
  { label: COUNTRY_NAMES[COUNTRIES.AUSTRALIA], value: COUNTRIES.AUSTRALIA },
  {
    label: COUNTRY_NAMES[COUNTRIES.NEW_ZEALAND],
    value: COUNTRIES.NEW_ZEALAND,
  },
  { label: COUNTRY_NAMES[COUNTRIES.UK], value: COUNTRIES.UK },
];
export const SECTOR_TYPE_OPTIONS = Object.entries(INDUSTRY_SECTOR_NAMES).map(
  ([key, label]) => ({
    label,
    value: Number(key),
  }),
);

export enum LEVEL_OF_SENIORITY {
  CEO = 0,
  VICE_PRESIDENT = 1,
  DIRECTOR = 2,
  SENIOR_MANAGER = 3,
  MANAGER = 4,
  INDIVIDUAL_CONTRIBUTOR = 5,
  OTHER = 6,
}

export const LEVEL_OF_SENIORITY_LABELS: Record<number, string> = {
  [LEVEL_OF_SENIORITY.CEO]: "CEO",
  [LEVEL_OF_SENIORITY.VICE_PRESIDENT]: "Vice President",
  [LEVEL_OF_SENIORITY.DIRECTOR]: "Director",
  [LEVEL_OF_SENIORITY.SENIOR_MANAGER]: "Senior Manager",
  [LEVEL_OF_SENIORITY.MANAGER]: "Manager",
  [LEVEL_OF_SENIORITY.INDIVIDUAL_CONTRIBUTOR]: "Individual Contributor",
  [LEVEL_OF_SENIORITY.OTHER]: "Other",
};

export enum BADGE_TYPE {
  RISING_STAR = 0,
  TRAILBLAZER = 1,
  POWER_PLAYER = 2,
  VANGUARD = 3,
  ICON = 4,
  EXPERT_BADGE = 5,
}

export const BADGE_TYPE_KEYS: Record<BADGE_TYPE, string> = {
  [BADGE_TYPE.RISING_STAR]: "Badge Rising Star",
  [BADGE_TYPE.TRAILBLAZER]: "Badge Trailblazer",
  [BADGE_TYPE.POWER_PLAYER]: "Badge Power Player",
  [BADGE_TYPE.VANGUARD]: "Badge Vanguard",
  [BADGE_TYPE.ICON]: "Badge Icon",
  [BADGE_TYPE.EXPERT_BADGE]: "Badge Expert Badge",
};
