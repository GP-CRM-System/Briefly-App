
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";
import Navbar from "../components/Navbar.tsx";
import DashboardHome from "@/features/dashboard/components/DashboardHome";
import Customers from "@/features/customers";
import CustomerProfile from "@/features/customers/components/CustomerProfile";
import Segments from "@/features/segments";
import SegmentDetails from "@/features/segments/components/SegmentDetails";
import Campaigns from "@/features/campaigns";
import CampaignDetails from "@/features/campaigns/components/CampaignDetails";
import Templates from "@/features/templates";
import TemplateDetails from "@/features/templates/components/TemplateDetails";
import Products from "@/features/products";
import ProductDetails from "@/features/products/components/ProductDetails";
import Orders from "@/features/orders";
import OrderDetails from "@/features/orders/components/OrderDetails";
import Tickets from "@/features/tickets";
import TicketDetails from "@/features/tickets/components/TicketDetails";
import Conversations from "@/features/conversations";
import Employees from "@/features/employees";
import EmployeeProfile from "@/features/employees/components/EmployeeProfile";
import Settings from "@/features/settings";
import AnalyticsPage from "@/features/analytics/components/AnalyticsPage";
import AiDashboard from "@/features/ai";
import { useSocketEvents } from "@/core/hooks";

const Dashboard = () => {
  useSocketEvents();
  const { pathname } = useLocation();
  const isConversations = pathname.includes("/conversations");

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <Navbar />

        <main className={`flex-grow flex flex-col min-h-0 p-4 md:p-6 lg:p-8 ${isConversations ? "overflow-hidden" : "overflow-y-auto"}`}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="segments" element={<Segments />} />
            <Route path="segments/:id" element={<SegmentDetails />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/:id" element={<CampaignDetails />} />
            <Route path="templates" element={<Templates />} />
            <Route path="templates/:id" element={<TemplateDetails />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="conversations/:id" element={<Conversations />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="ai" element={<AiDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
