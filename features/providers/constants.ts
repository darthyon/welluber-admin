import type { DurationUnit, ValidationUnit, RedemptionUnit, MembershipStartDay } from "@/types/provider";

export const SP_STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Removed", value: "removed" },
] as const;

export const COMMISSION_RATE_MIN = 0.10;
export const COMMISSION_RATE_MAX = 0.30;

export const CURRENCIES = ["MYR"] as const;
export type Currency = typeof CURRENCIES[number];

export const DURATION_UNITS: { label: string; value: DurationUnit }[] = [
  { label: "Session (one-time)", value: "session" },
  { label: "Minutes", value: "min" },
  { label: "Hours", value: "hr" },
  { label: "Days", value: "day" },
  { label: "Months", value: "month" },
  { label: "Years", value: "year" },
];

export const VALIDATION_UNITS: { label: string; value: ValidationUnit }[] = [
  { label: "Days", value: "days" },
  { label: "Months", value: "months" },
  { label: "Half-year (6 months)", value: "half_year" },
  { label: "Year", value: "year" },
];

export const REDEMPTION_UNITS: { label: string; value: RedemptionUnit }[] = [
  { label: "Hours", value: "hr" },
  { label: "Days", value: "day" },
  { label: "Months", value: "month" },
];

export const MEMBERSHIP_START_DAYS: { label: string; value: MembershipStartDay }[] = [
  { label: "None", value: "none" },
  { label: "1st of month", value: "1st" },
  { label: "15th of month", value: "15th" },
];

export const OPERATING_DAYS = [
  { key: "mon" as const, label: "Monday" },
  { key: "tue" as const, label: "Tuesday" },
  { key: "wed" as const, label: "Wednesday" },
  { key: "thu" as const, label: "Thursday" },
  { key: "fri" as const, label: "Friday" },
  { key: "sat" as const, label: "Saturday" },
  { key: "sun" as const, label: "Sunday" },
] as const;

export type DayKey = typeof OPERATING_DAYS[number]["key"];

export const BRANCH_CONTACT_TYPES = [
  { label: "Branch Manager", value: "branch_manager" },
  { label: "Staff", value: "staff" },
  { label: "Reception", value: "reception" },
] as const;

export const DEFAULT_OPERATING_HOURS = {
  mon: { open: "09:00", close: "18:00", isClosed: false },
  tue: { open: "09:00", close: "18:00", isClosed: false },
  wed: { open: "09:00", close: "18:00", isClosed: false },
  thu: { open: "09:00", close: "18:00", isClosed: false },
  fri: { open: "09:00", close: "18:00", isClosed: false },
  sat: { open: "09:00", close: "13:00", isClosed: false },
  sun: { open: "09:00", close: "13:00", isClosed: true },
};
