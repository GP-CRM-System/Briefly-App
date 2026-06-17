import { useEffect } from "react";
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
import { PermissionGuard, AccessDenied, TourOverlay } from "@/core/components";
import NotFoundPage from "@/pages/NotFoundPage";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth.store";
import { useTourStore } from "@/store/tour.store";

const Dashboard = () => {
  useSocketEvents();
  const { pathname } = useLocation();
  const isConversations = pathname.includes("/conversations");
  const { tourCompleted, startTour } = useTourStore();

  useEffect(() => {
    if (!tourCompleted) {
      const timer = setTimeout(() => startTour(), 1200);
      return () => clearTimeout(timer);
    }
  }, [tourCompleted, startTour]);

  useEffect(() => {
    const checkAndFixSession = async () => {
      const currentSession = useAuthStore.getState();
      const hasPermissions = currentSession.permissions && Object.keys(currentSession.permissions).length > 0;
      
      if (!currentSession.role || !hasPermissions) {
        try {
          // Re-fetch user details using /me
          const { data: meResponse } = await apiClient.get("/me");
          const meData = meResponse.data;
          let activeOrgId = meData?.activeOrganizationId;
          
          if (!activeOrgId) {
            // Fetch organizations the user belongs to
            const { data: orgs } = await apiClient.get(ENDPOINTS.ORGANIZATION.LIST);
            const orgList = Array.isArray(orgs) ? orgs : (orgs?.organizations || []);
            
            if (orgList.length > 0) {
              const firstOrg = orgList[0];
              activeOrgId = firstOrg.id;
              
              // Set the active organization on the backend
              await apiClient.post(ENDPOINTS.ORGANIZATION.SET_ACTIVE, {
                organizationId: activeOrgId
              });
            }
          }
          
          if (activeOrgId) {
            // Re-fetch user details now that we have an active organization
            const { data: updatedMeResponse } = await apiClient.get("/me");
            const updatedMeData = updatedMeResponse.data;
            const token = useAuthStore.getState().token;
            
            if (updatedMeData && token) {
              const { role, permissions, activeOrganizationId, ...user } = updatedMeData;
              useAuthStore.getState().setSession(
                token,
                user as any,
                role ?? null,
                permissions ?? {},
                true
              );
            }
          }
        } catch (err) {
          console.error("[Dashboard] Auto-heal session failed:", err);
        }
      }
    };
    checkAndFixSession();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <TourOverlay />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <Navbar />

        <main className={`flex-grow flex flex-col min-h-0 p-4 md:p-6 lg:p-8 ${isConversations ? "overflow-hidden" : "overflow-y-auto"}`}>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="customers" element={<PermissionGuard permission="customers:read" fallback={<AccessDenied />}><Customers /></PermissionGuard>} />
            <Route path="customers/:id" element={<PermissionGuard permission="customers:read" fallback={<AccessDenied />}><CustomerProfile /></PermissionGuard>} />
            <Route path="segments" element={<PermissionGuard permission="segments:read" fallback={<AccessDenied />}><Segments /></PermissionGuard>} />
            <Route path="segments/:id" element={<PermissionGuard permission="segments:read" fallback={<AccessDenied />}><SegmentDetails /></PermissionGuard>} />
            <Route path="campaigns" element={<PermissionGuard permission="campaigns:read" fallback={<AccessDenied />}><Campaigns /></PermissionGuard>} />
            <Route path="campaigns/:id" element={<PermissionGuard permission="campaigns:read" fallback={<AccessDenied />}><CampaignDetails /></PermissionGuard>} />
            <Route path="templates" element={<PermissionGuard permission="campaigns:read" fallback={<AccessDenied />}><Templates /></PermissionGuard>} />
            <Route path="templates/:id" element={<PermissionGuard permission="campaigns:read" fallback={<AccessDenied />}><TemplateDetails /></PermissionGuard>} />
            <Route path="products" element={<PermissionGuard permission="products:read" fallback={<AccessDenied />}><Products /></PermissionGuard>} />
            <Route path="products/:id" element={<PermissionGuard permission="products:read" fallback={<AccessDenied />}><ProductDetails /></PermissionGuard>} />
            <Route path="orders" element={<PermissionGuard permission="orders:read" fallback={<AccessDenied />}><Orders /></PermissionGuard>} />
            <Route path="orders/:id" element={<PermissionGuard permission="orders:read" fallback={<AccessDenied />}><OrderDetails /></PermissionGuard>} />
            <Route path="tickets" element={<PermissionGuard permission="supportTickets:read" fallback={<AccessDenied />}><Tickets /></PermissionGuard>} />
            <Route path="tickets/:id" element={<PermissionGuard permission="supportTickets:read" fallback={<AccessDenied />}><TicketDetails /></PermissionGuard>} />
            <Route path="conversations" element={<PermissionGuard permission="conversations:read" fallback={<AccessDenied />}><Conversations /></PermissionGuard>} />
            <Route path="conversations/:id" element={<PermissionGuard permission="conversations:read" fallback={<AccessDenied />}><Conversations /></PermissionGuard>} />
            <Route path="employees" element={<PermissionGuard permission="member:read" fallback={<AccessDenied />}><Employees /></PermissionGuard>} />
            <Route path="employees/:id" element={<PermissionGuard permission="member:read" fallback={<AccessDenied />}><EmployeeProfile /></PermissionGuard>} />
            <Route path="settings" element={<PermissionGuard permission="organization:read" fallback={<AccessDenied />}><Settings /></PermissionGuard>} />
            <Route path="analytics" element={<PermissionGuard permission="reports:read" fallback={<AccessDenied />}><AnalyticsPage /></PermissionGuard>} />
            <Route path="ai" element={<PermissionGuard permission="ai:read" fallback={<AccessDenied />}><AiDashboard /></PermissionGuard>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
