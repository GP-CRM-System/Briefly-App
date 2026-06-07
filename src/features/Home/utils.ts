import type { StatColor } from "./types";

export const colorClasses: Record<StatColor, string> = {
  blue: "bg-blue-600",
  green: "bg-green-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
};

export const iconBgClasses: Record<StatColor, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-600",
};

// helpers
export const getColorClass = (color: StatColor): string => {
  return colorClasses[color] || colorClasses.blue;
};

export const getIconBgClass = (color: StatColor): string => {
  return iconBgClasses[color] || iconBgClasses.blue;
};
