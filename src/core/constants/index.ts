export const CUSTOMER_SOURCES = [
  { value: "WEBSITE", label: "Website" },
  { value: "SOCIAL", label: "Social Media" },
  { value: "REFERRAL", label: "Referral" },
  { value: "ORGANIC", label: "Organic Search" },
  { value: "EMAIL", label: "Email Campaign" },
  { value: "CAMPAIGN", label: "Ad Campaign" },
  { value: "OTHER", label: "Other" },
] as const;

export type CustomerSource = (typeof CUSTOMER_SOURCES)[number]["value"];


export const CUSTOMER_LIFECYCLE_STAGES = [
  { value: "LEAD", label: "Lead" },
  { value: "NEW", label: "New" },
  { value: "ACTIVE", label: "Active" },
  { value: "LOYAL", label: "Loyal" },
  { value: "AT_RISK", label: "At-Risk" },
  { value: "CHURNED", label: "Churned" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "ONE_TIME", label: "One Time" },
  { value: "RETURNING", label: "Returning" },
  { value: "VIP", label: "VIP" },
  { value: "WINBACK", label: "Winback" },
] as const;

export type CustomerLifecycleStage = (typeof CUSTOMER_LIFECYCLE_STAGES)[number]["value"];


export const BOOLEAN_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
] as const;
