
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
import { useSocketEvents } from "@/core/hooks";
import { PermissionGuard, AccessDenied } from "@/core/components";
import NotFoundPage from "@/pages/NotFoundPage";

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
            <Route path="customers" element={<PermissionGuard permission="customers.read" fallback={<AccessDenied />}><Customers /></PermissionGuard>} />
            <Route path="customers/:id" element={<PermissionGuard permission="customers.read" fallback={<AccessDenied />}><CustomerProfile /></PermissionGuard>} />
            <Route path="segments" element={<PermissionGuard permission="segments.read" fallback={<AccessDenied />}><Segments /></PermissionGuard>} />
            <Route path="segments/:id" element={<PermissionGuard permission="segments.read" fallback={<AccessDenied />}><SegmentDetails /></PermissionGuard>} />
            <Route path="campaigns" element={<PermissionGuard permission="campaigns.read" fallback={<AccessDenied />}><Campaigns /></PermissionGuard>} />
            <Route path="campaigns/:id" element={<PermissionGuard permission="campaigns.read" fallback={<AccessDenied />}><CampaignDetails /></PermissionGuard>} />
            <Route path="products" element={<PermissionGuard permission="products.read" fallback={<AccessDenied />}><Products /></PermissionGuard>} />
            <Route path="products/:id" element={<PermissionGuard permission="products.read" fallback={<AccessDenied />}><ProductDetails /></PermissionGuard>} />
            <Route path="orders" element={<PermissionGuard permission="orders.read" fallback={<AccessDenied />}><Orders /></PermissionGuard>} />
            <Route path="orders/:id" element={<PermissionGuard permission="orders.read" fallback={<AccessDenied />}><OrderDetails /></PermissionGuard>} />
            <Route path="tickets" element={<PermissionGuard permission="supportTickets.read" fallback={<AccessDenied />}><Tickets /></PermissionGuard>} />
            <Route path="tickets/:id" element={<PermissionGuard permission="supportTickets.read" fallback={<AccessDenied />}><TicketDetails /></PermissionGuard>} />
            <Route path="conversations" element={<PermissionGuard permission="conversations.read" fallback={<AccessDenied />}><Conversations /></PermissionGuard>} />
            <Route path="conversations/:id" element={<PermissionGuard permission="conversations.read" fallback={<AccessDenied />}><Conversations /></PermissionGuard>} />
            <Route path="employees" element={<PermissionGuard permission="member.read" fallback={<AccessDenied />}><Employees /></PermissionGuard>} />
            <Route path="employees/:id" element={<PermissionGuard permission="member.read" fallback={<AccessDenied />}><EmployeeProfile /></PermissionGuard>} />
            <Route path="settings" element={<PermissionGuard permission="organization.read" fallback={<AccessDenied />}><Settings /></PermissionGuard>} />
            <Route path="analytics" element={<PermissionGuard permission="reports.read" fallback={<AccessDenied />}><AnalyticsPage /></PermissionGuard>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
