import arrowUp from "@assets/icons/dashboard/arrow-up.svg";
import arrowDown from "@assets/icons/dashboard/arrow-down.svg";

interface HomeStatCardProps {
  title: string;
  value: string | number;
  change: string | number;
  isPositive: boolean;
  icon: string;
  color?: "blue" | string;
}
export default function HomeStatCard({
  title,
  value,
  change,
  isPositive,
  icon,
  color = "blue",
}: HomeStatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          {/* Vertical Bar */}
          <div className="w-0.5 rounded-full self-stretch bg-blue-500" />

          <div>
            <p className="text-[#8A8A8A] text-sm text-[16px] font-medium mb-1">
              {title}
            </p>
            <h3 className="text-[24px] font-medium text-black">
              {typeof value === "number"
                ? value.toLocaleString()
                : value || "0"}
            </h3>
          </div>
        </div>

        {/* Icon Circle */}
        <div className="p-3 rounded-full bg-[#4A90E230]">
          {icon && <img src={icon} alt="" className="w-5 h-5 object-contain" />}
        </div>
      </div>

      {/* Trend Indicator */}
      <div
        className={`flex items-center gap-1.5 text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}
      >
        <img
          src={isPositive ? arrowUp : arrowDown}
          alt={isPositive ? "up" : "down"}
          className="w-4 h-4"
        />
        <span>
          {isPositive ? "+" : "-"}
          {Math.abs(Number(change) || 0)}% Since Last week
        </span>
      </div>
    </div>
  );
}
