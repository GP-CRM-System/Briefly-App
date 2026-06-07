import customersIcon from "@assets/new/customers.svg";
import campaignIcon from "@assets/new/campaigns.svg";
import productIcon from "@assets/new/products.svg";
import orderIcon from "@assets/new/orders.svg";
import HomeStatCard from "./components/HomeStatCard";
import SalesOverviewChart from "./components/SalesOverview";
import SupportTicketsChart from "./components/SupportTicketChart";
import RecentActivitiesTable from "./components/RecentActivitiesTable";
import type { StatItem } from "./types";
import { useDashboardReport } from "./dashboard.hooks";

export default function Home() {
  const { data: report, isLoading } = useDashboardReport();

  const revenue = report?.revenue;

  const stats: StatItem[] = [
    {
      title: "Total Customers",
      value: 1200,
      change: 7,
      isPositive: true,
      icon: customersIcon,
      color: "blue",
    },
    {
      title: "Total Campaigns",
      value: 30,
      change: 5,
      isPositive: true,
      icon: campaignIcon,
      color: "blue",
    },
    {
      title: "Total Products",
      value: 560,
      change: 3,
      isPositive: false,
      icon: productIcon,
      color: "blue",
    },
    {
      title: "Total Orders",
      value: revenue?.currentOrderCount ?? 0,
      change: Math.abs(Math.round(revenue?.orderGrowth ?? 0)),
      isPositive: (revenue?.orderGrowth ?? 0) >= 0,
      icon: orderIcon,
      color: "blue",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[140px] animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesOverviewChart />
          </div>
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
            <div className="h-[300px] bg-gray-100 rounded-full animate-pulse mx-auto w-[250px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <HomeStatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesOverviewChart />
        </div>
        <div className="lg:col-span-1">
          <SupportTicketsChart />
        </div>
      </div>

      <RecentActivitiesTable />
    </div>
  );
}
