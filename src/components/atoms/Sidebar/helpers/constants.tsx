import {
  Building2,
  // CalendarDays,
  CreditCard,
  // Crown,
  // FileText,
  LayoutDashboard,
  LucideProps,
  // Podcast,
  // Radio,
  // Repeat,
  // Settings,
  // TicketPercent,
  UserCheck,
  UserCog,
  // Users,
  // Video,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

import { LOGIN_ROLE } from "@/shared/constants";
import { ROUTES } from "@/shared/routes";

export type NavItem = {
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  path?: string;
  activePaths?: string[];
  children?: NavItem[];
  badge?: string;
  allowedRoles?: LOGIN_ROLE[];
};

export const NAV_LABEL_PREFIX = "common.";

export const getNavItemLabelKey = (label: string): string =>
  label.startsWith(NAV_LABEL_PREFIX)
    ? label.slice(NAV_LABEL_PREFIX.length)
    : label;

export const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboards",
    // path: ROUTES.DASHBOARD,
    activePaths: [ROUTES.DASHBOARD_ANALYTICS],
    badge: "5",
    allowedRoles: [LOGIN_ROLE.ADMIN],
    children: [
      {
        label: "Analytics",
        path: ROUTES.DASHBOARD_ANALYTICS,
        activePaths: [ROUTES.DASHBOARD_ANALYTICS],
      },
    ],
  },
  {
    icon: Building2,
    label: "Properties",
    activePaths: [ROUTES.PROPERTIES, ROUTES.PROPERTIES_ORGANISATIONS],
    allowedRoles: [LOGIN_ROLE.ADMIN],
    children: [
      {
        label: "All Properties",
        path: ROUTES.PROPERTIES,
        activePaths: [ROUTES.PROPERTIES],
      },
      {
        label: "Organisation Properties",
        path: ROUTES.PROPERTIES_ORGANISATIONS,
        activePaths: [ROUTES.PROPERTIES_ORGANISATIONS],
      },
    ],
  },
  {
    icon: Building2,
    label: "Organisation Properties",
    path: ROUTES.ORGANISATIONS_PROPERTIES,
    activePaths: [ROUTES.ORGANISATIONS_PROPERTIES],
    allowedRoles: [LOGIN_ROLE.ORGANISATION],
  },
  {
    icon: Building2,
    label: "Organisation",
    path: ROUTES.ORGANISATIONS,
    activePaths: [ROUTES.ORGANISATIONS],
    allowedRoles: [LOGIN_ROLE.ADMIN],
  },
  {
    icon: UserCog,
    label: "Users",
    // path: ROUTES.USERS,
    activePaths: [
      ROUTES.USERS,
      ROUTES.USERS_LIST,
      ROUTES.USERS_REPORTED,
      ROUTES.USERS_SPOTLIGHTED,
    ],
    allowedRoles: [LOGIN_ROLE.ADMIN],
    children: [
      {
        label: "List",
        path: ROUTES.USERS_LIST,
        activePaths: [ROUTES.USERS_LIST],
      },
      // {
      //   label: "Reported Users",
      //   path: ROUTES.USERS_REPORTED,
      //   activePaths: [ROUTES.USERS_REPORTED],
      // },
      // {
      //   label: "Spotlighted Users",
      //   path: ROUTES.USERS_SPOTLIGHTED,
      //   activePaths: [ROUTES.USERS_SPOTLIGHTED],
      // },
    ],
  },
  {
    icon: CreditCard,
    label: "Token Requests",
    path: ROUTES.TOKEN_REQUESTS_LIST,
    activePaths: [ROUTES.TOKEN_REQUESTS_LIST],
    allowedRoles: [LOGIN_ROLE.ADMIN],
  },
  {
    icon: UserCheck,
    label: "KYC",
    activePaths: [ROUTES.KYC_PENDING],
    allowedRoles: [LOGIN_ROLE.ADMIN],
    children: [
      {
        label: "Pending KYC",
        path: ROUTES.KYC_PENDING,
        activePaths: [ROUTES.KYC_PENDING],
      },
    ],
  },
  // {
  //   icon: Video,
  //   label: "Videos",
  //   path: ROUTES.VIDEOS_LIST,
  //   activePaths: [ROUTES.VIDEOS_LIST],
  // },
  // {
  //   icon: CalendarDays,
  //   label: "Events",
  //   path: ROUTES.EVENTS_LIST,
  //   activePaths: [ROUTES.EVENTS_LIST],
  // },
  // {
  //   icon: Podcast,
  //   label: "Podcasts",
  //   path: ROUTES.PODCASTS_LIST,
  //   activePaths: [ROUTES.PODCASTS_LIST],
  // },
  // {
  //   icon: Settings,
  //   label: "Config",
  //   // path: ROUTES.CONFIGS,
  //   activePaths: [
  //     ROUTES.CONFIGS,
  //     ROUTES.CONFIGS_LIST,
  //     ROUTES.CONFIGS_POINT_RULES,
  //     ROUTES.CONFIGS_DEFAULT_FEATURES,
  //   ],
  //   children: [
  //     {
  //       label: "Point Rules",
  //       path: ROUTES.CONFIGS_POINT_RULES,
  //       activePaths: [ROUTES.CONFIGS_POINT_RULES],
  //     },
  //     {
  //       label: "Default Features",
  //       path: ROUTES.CONFIGS_DEFAULT_FEATURES,
  //       activePaths: [ROUTES.CONFIGS_DEFAULT_FEATURES],
  //     },
  //   ],
  // },
  // {
  //   icon: UserCog,
  //   label: "Roles",
  //   path: ROUTES.ROLES_LIST,
  //   activePaths: [ROUTES.ROLES_LIST],
  // },
  // {
  //   icon: TicketPercent,
  //   label: "Promo Codes",
  //   path: ROUTES.PROMO_CODES_LIST,
  //   activePaths: [ROUTES.PROMO_CODES_LIST],
  // },
  // {
  //   icon: Building2,
  //   label: "Companies",
  //   path: ROUTES.COMPANIES_LIST,
  //   activePaths: [ROUTES.COMPANIES_LIST],
  // },
  // {
  //   icon: Users,
  //   label: "Groups",
  //   activePaths: [ROUTES.GROUPS_LIST, ROUTES.GROUPS_INACTIVE],
  //   children: [
  //     {
  //       label: "List",
  //       path: ROUTES.GROUPS_LIST,
  //       activePaths: [ROUTES.GROUPS_LIST],
  //     },
  //     {
  //       label: "Inactive Groups",
  //       path: ROUTES.GROUPS_INACTIVE,
  //       activePaths: [ROUTES.GROUPS_INACTIVE],
  //     },
  //   ],
  // },
  // {
  //   icon: CreditCard,
  //   label: "Transactions",
  //   path: ROUTES.TRANSACTIONS_LIST,
  //   activePaths: [ROUTES.TRANSACTIONS_LIST],
  // },
  // {
  //   icon: Repeat,
  //   label: "Subscriptions",
  //   path: ROUTES.SUBSCRIPTIONS_LIST,
  //   activePaths: [ROUTES.SUBSCRIPTIONS_LIST],
  // },
  // {
  //   icon: Crown,
  //   label: "Plans",
  //   path: ROUTES.PLANS_LIST,
  //   activePaths: [ROUTES.PLANS_LIST],
  // },
  // {
  //   icon: FileText,
  //   label: "Posts",
  //   path: ROUTES.POSTS_LIST,
  //   activePaths: [ROUTES.POSTS_LIST],
  // },
  // {
  //   icon: Radio,
  //   label: "Broadcast Messages",
  //   path: ROUTES.BROADCAST_MESSAGES_LIST,
  //   activePaths: [ROUTES.BROADCAST_MESSAGES_LIST],
  // },
];

/**
 * Filter nav items by the current user's role.
 * Items without `allowedRoles` are visible to all roles.
 */
export const getFilteredNavItems = (role: LOGIN_ROLE): NavItem[] => {
  return navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(role),
  );
};
