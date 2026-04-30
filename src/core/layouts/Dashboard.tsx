import { useState } from "react";

import Sidebar from "../components/Sidebar.tsx";



const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* <Navbar /> */}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="contact" 
              element={
                <RoutePermissionGuard permission="Contact.read">
                  <Contact />
                </RoutePermissionGuard>
              } 
            />
            <Route 
              path="companies" 
              element={
                <RoutePermissionGuard permission="Company.read">
                  <Companies />
                </RoutePermissionGuard>
              } 
            />
            <Route 
              path="deals" 
              element={
                <RoutePermissionGuard permission="Deal.read">
                  <Deals />
                </RoutePermissionGuard>
              } 
            />
            <Route 
              path="tickets" 
              element={
                <RoutePermissionGuard permission="Ticket.read">
                  <Tickets />
                </RoutePermissionGuard>
              } 
            />
            <Route 
              path="order" 
              element={
                <RoutePermissionGuard permission="Order.read">
                  <Order />
                </RoutePermissionGuard>
              } 
            />
            <Route 
              path="employee" 
              element={
                <RoutePermissionGuard permission="Employee.read">
                  <Employee />
                </RoutePermissionGuard>
              } 
            />
            <Route 
              path="analytics" 
              element={
                <RoutePermissionGuard permission="Analytics.read">
                  <Analytics />
                </RoutePermissionGuard>
              } 
            />
            <Route path="settings/*" element={<div className="lg:-m-6"><Settings /></div>} />
          </Routes> */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
