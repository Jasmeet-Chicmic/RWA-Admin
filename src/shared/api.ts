const API_VERSION = "v1";
const API_VERSION_V2 = "v2";

export const API_END_POINTS = {
  LOGIN: `/admin/auth/login`,
  LOGIN_VERIFY: `${API_VERSION}/admin/loginVerify`,
  FORGOT_PASSWORD: `${API_VERSION}/admin/forgotPassword`,
  RESET_PASSWORD: `${API_VERSION}/admin/resetPassword`,
  LOGOUT: `/admin/logout`,
  LOGOUT_ORGANISATION: `/organizations/logout`,
  ORGANIZATION_PROFILE: `/organizations/profile`,
  ORGANIZATION_PROPERTIES: `/organizations/properties`,
  ADMIN_PROFILE: `/admin/profile`,
  USER: `/admin/users`,
  USER_BY_ID: `/user-profile/api/admin/users`,
  USER_TOGGLE_STATUS: `/user-profile/api/admin/users`,
  USER_TOGGLE_SPOTLIGHT: `/user-profile/api/admin/users`,
  REPORTED_USERS: `/user-profile/api/admin/reported-users`,
  USER_UPDATE: `${API_VERSION}/user`,
  USER_STATS: `${API_VERSION}/user/stats`,
  LOGOUT_USER: `${API_VERSION}/user/logout-admin`,
  INVOICES: `${API_VERSION}/invoices`,
  INVOICES_STATS: `${API_VERSION}/invoices/stats`,
  INVOICES_DETAILS: `${API_VERSION}/invoices/details`,
  INVOICES_DOWNLOAD: `${API_VERSION}/invoices/downloadInvoice`,
  PROJECTS: `${API_VERSION}/projects`,
  CLIENTS: `${API_VERSION}/clients`,
  USER_ACTIVITY: `${API_VERSION}/userActivity`,
  USER_LOGIN_TACKING: `${API_VERSION}/user/loginTracking`,
  PRODUCT_POPULAR: `${API_VERSION}/product/popular`,

  // Dashboard Endpoints
  WEBSITE_ANALYTICS: `${API_VERSION}/dashboard/websiteAnalytics`,
  AVERAGE_DAILY_SALES: `${API_VERSION}/dashboard/averageDailySales`,
  SALES_OVERVIEW: `${API_VERSION}/dashboard/salesOverview`,
  EARNINGS_REPORT: `${API_VERSION_V2}/dashboard/earningsReport`,
  SUPPORT_TICKETS: `${API_VERSION}/dashboard/supportTickets`,
  SALES_BY_COUNTRY: `${API_VERSION}/dashboard/salesByCountry`,
  TOTAL_EARNINGS: `${API_VERSION}/dashboard/totalEarnings`,
  TOP_TRANSACTIONS: `${API_VERSION}/product/topTransaction`,
  TRANSACTIONS: `${API_VERSION}/transaction`,
  USER_TRANSACTIONS: `${API_VERSION}/transaction`,
  TRANSACTION_STATS: `${API_VERSION}/transaction/stats`,
  DASHBOARD_STATS: `${API_VERSION}/dashboard/stats`,
  DASHBOARD_ANALYTICS: `${API_VERSION}/dashboard/analytics`,
  DASHBOARD_ACTIVITY: `${API_VERSION}/dashboard/activity`,
  DASHBOARD_COUNTRY: `${API_VERSION}/dashboard/country`,
  DASHBOARD_USER_GRAPH: `${API_VERSION}/dashboard/user/graph`,
  DASHBOARD_IN_DEMAND_PROPERTIES: `${API_VERSION}/dashboard/in-demand-properties`,

  PAYMENY_METHODS: `${API_VERSION}/paymentMethods`,
  INVOICE_COUNTER: `${API_VERSION}/counters`,

  SUBSCRIPTION_PLANS: `${API_VERSION}/subscriptionPlans`,
  SUBSCRIPTION_USERS: `${API_VERSION}/subscriptionPlans/purchaseHistory`,

  CURRENT_SUBSCRIPTION: `${API_VERSION}/user/currentSubscription`,
  UPGRADE_USER_PLAN: `${API_VERSION}/user/upgradeSubscription`,
  CANCEL_USER_SUBSCRIPTION: `${API_VERSION}/user/cancelSubscription`,
  BADGES: `${API_VERSION}/badges`,
  USER_BADGES: `${API_VERSION}/userBadges`,
  PAYMENT_METHODS: `${API_VERSION}/paymentMethods`,
  PROMO_CODES: `${API_VERSION}/promotionalCodes`,
  USER_PROMO_CODES: `${API_VERSION}/userPromotionCodes`,
  PROMO_CODES_ADMIN: `/payment/api/admin/promoCodes`,

  //Company Endpoints
  COMPANY: `/network/api/admin/companies`,
  COMPANY_VERIFICATION: `/network/api/admin/companies`,
  COMPANY_ACCESS: `/network/api/admin/companies`,
  USER_COMPANIES: `/network/api/admin/userCompanies`,
  UPLOAD_BADGE_IMAGE: `${API_VERSION}/file/upload`,

  //Jobs
  JOBS: `${API_VERSION}/jobs`,
  APPLICATIONS: `${API_VERSION}/jobApplications`,

  // Game Configs
  GAME_CONFIGS: `${API_VERSION}/game-configs`,
  GAME_STATS: `${API_VERSION}/games/stats`,
  REVENUE_PER_GAME: `${API_VERSION}/games/revenue-per-game`,
  GAME_PLAYED: `${API_VERSION}/games/games-played`,

  // Bets History
  BETS_HISTORY: `${API_VERSION}/games/bets-history-admin`,
  BIG_BETS_HISTORY: `${API_VERSION}/games/big-bets-history`,

  // Config
  CONFIG: `${API_VERSION}/config`,

  // Chat
  CHAT_ROOMS: `${API_VERSION}/chat/rooms`,
  CHAT: `${API_VERSION}/chat`,

  // Bonus Slides
  BONUS_SLIDES: `${API_VERSION}/bonus/slide`,
  BONUS_SLIDE_BY_ID: `${API_VERSION}/bonus/slide/fetch-by-id`,
  BONUS_SLIDE_IS_ACTIVE: `${API_VERSION}/bonus/slide/is-active`,
  FILE_UPLOAD: `${API_VERSION}/file/upload`,
  BATCH_UPLOAD: `/batch-upload`,

  // Podcasts
  PODCASTS: `/network/api/podcast/admin/get-all`,
  PODCAST_CREATE: `/network/api/podcast/create`,
  PODCAST: `/network/api/podcast`,
  PODCAST_UPDATE: `/network/api/podcast/update`,
  PODCAST_ENABLE: `/network/api/podcast/enable`,

  // Videos
  VIDEOS: `/post/api/videos`,

  // Roles
  ROLES: `/security/api/admin/roles`,
  ASSIGN_ROLE: `/security/api/admin/assign-role`,
  ROLE_FEATURES: `/security/api/admin/roles`,

  // User Features
  USER_FEATURES: `/security/api/admin/user-features`,
  UPDATE_ROLE_FEATURE: `/security/api/admin/update-feature`,

  // Point Rules
  POINT_RULES: `/user-profile/api/admin/point-rules`,

  // Default Features
  DEFAULT_FEATURES: `/payment/api/admin/features/get-all`,
  UPDATE_DEFAULT_FEATURES: `/payment/api/admin/features/update-values`,
  UPDATE_FEATURE_ACTIVE_STATUS: `/payment/api/admin/features/active-status`,

  // Events
  EVENTS: `/network/api/admin/events`,

  // Groups
  GROUPS: `/network/api/admin/groups`,
  GROUPS_STATUS: `/network/api/admin/groups`,
  GROUPS_INACTIVE: `/network/api/admin/groups/inactive`,
  GROUPS_ALERT_INACTIVE: `/network/api/admin/groups`,

  // Admin Transactions
  ADMIN_TRANSACTIONS: `/admin/transactions`,
  // Organisation Transactions
  ORGANIZATION_TRANSACTIONS: `/organizations/transactions`,

  // Admin Subscriptions
  ADMIN_SUBSCRIPTIONS: `/payment/api/admin/subscriptions`,
  ADJUST_SUBSCRIPTION: `/payment/api/admin/subscription/adjust`,

  // Plans
  PLANS: `/payment/api/plans`,
  ADJUST_PLAN_PRICING: `/payment/api/admin/pricing/adjustSubscription`,
  SUBSCRIPTION_ANALYTICS: `/admin/plans/subscription-analytics`,

  // Posts
  ADMIN_POSTS_TABLE: `/post/api/admin/posts/table`,
  ADMIN_POSTS_BULK_ACTION: `/post/api/admin/posts/bulk-action`,
  ADMIN_POSTS_DELETE: `/post/api/admin/posts`,

  // Properties
  ADMIN_ALL_PROPERTIES: `/admin/properties`,
  ADMIN_PROPERTIES: `/admin/properties`,
  ADMIN_PROPERTY_APPROVE: (propertyId: string) =>
    `/admin/properties/${propertyId}/approve`,
  ADMIN_PROPERTY_REJECT: (propertyId: string) =>
    `/admin/properties/${propertyId}/reject`,
  ADMIN_PROPERTY_ASSIGN_ORGANIZATION: (propertyId: string) =>
    `/admin/properties/${propertyId}/assign-organization`,
  ADMIN_PROPERTIES_PENDING: `/admin/properties/pending`,
  /** Single property detail for admin (requires valid property GUID). */
  ADMIN_PROPERTY_BY_ID: (propertyId: string) =>
    `/admin/properties/${propertyId}`,
  ORGANIZATION_PROPERTY_BY_ID: (propertyId: string) =>
    `/organizations/properties/${propertyId}`,

  // KYC
  ADMIN_KYC_PENDING: `/api/admin/kyc`,
  ADMIN_IDENTITY_CLAIM_REQUESTS: `/v1/admin/identity/claim-requests`,
  ADMIN_IDENTITY_ASSIGNABLE_PROPERTIES: `/v1/admin/identity/assignable-properties`,
  ADMIN_IDENTITY_REGISTER_IDENTITY: `/v1/admin/identity/register-identity`,

  // Organisations
  ADMIN_ORGANISATIONS: `/admin/organizations`,
  FETCH_ORGANISATION_SPECIFIC: `/admin/organizations/fetchSpecific`,

  // Tokens
  ADMIN_TOKEN_REQUESTS: `/api/admin/tokens/requests`,

  // Reports
  REPORTS_COMPANY_CREATED: `/network/api/admin/reports/company/created`,
  REPORTS_USER_RETENTION: `/admin/reports/user-retention`,
  REPORTS_COMPANY_FOLLOWER: `/network/api/admin/reports/company/follower`,
  REPORTS_GROUP_CREATED: `/network/api/admin/reports/group/created`,
  REPORTS_GROUP_JOINED: `/network/api/admin/reports/group/joined`,
  REPORTS_CONVERSION_RATE: `/network/api/admin/reports/conversion-rate-graph`,
  REPORTS_EVENT_CREATED: `/network/api/admin/reports/event/created`,
  REPORTS_EVENT_ATTENDEE: `/network/api/admin/reports/event/attendee`,
  REPORTS_ENGAGEMENT_ANALYTICS: `/network/api/admin/reports/engagement-analytics/all`,
  USER_SPOTLIGHT_STATUS: `/user-profile/api/admin/users/spotlight-status`,

  // Broadcast Messages
  BROADCAST_CHANNELS: `/messaging/api/admin/get-broadcast-channel`,
  BROADCAST_MESSAGES: `/messaging/api/admin/get-messages`,
  BROADCAST_SEND_MESSAGE: `/messaging/api/admin/send-message`,
  MARKETING_SUBSCRIPTION: `/security/api/admin/marketing-subscription`,
  PROPERTIES_INVESTOR_USERS: `/properties/investor-users`,
  PROPERTIES_WHITELISTED_USERS: `/properties/whitelisted-users`,
};

export const INTERNAL_API_PATHS = {
  ADMIN_AUTH_LOGIN: "/admin/auth/login",
  ADMIN_WALLET_VERIFY: "/admin/wallet/verify",
  ORG_AUTH_LOGIN: "/organizations/login",
  ORG_WALLET_VERIFY: "/organizations/wallet/verify",
  PROPERTY_ONCHAIN_INITIATE: "/v1/property-onchain/initiate",
  PROPERTY_ONCHAIN_TREX_DEPLOYED: "/v1/property-onchain/trex-deployed",
  PROPERTY_ONCHAIN_VAULT_DEPLOYED: "/v1/property-onchain/vault-deployed",
  PROPERTY_ONCHAIN_PROPERTY_REGISTERED:
    "/v1/property-onchain/property-registered",
  PROPERTY_ONCHAIN_KYC_DONE: "/v1/property-onchain/kyc-done",
  PROPERTY_ONCHAIN_UNPAUSE_DONE: "/v1/property-onchain/unpause-done",
  PROPERTY_ONCHAIN_MINTED: "/v1/property-onchain/minted",
  PROPERTY_ONCHAIN_COMPLIANCE_BOUND: "/v1/property-onchain/compliance-bound",
  PROPERTY_ONCHAIN_STATUS: "/v1/property-onchain/status",
} as const;
