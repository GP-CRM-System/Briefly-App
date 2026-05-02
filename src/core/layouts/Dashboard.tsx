
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";
import Navbar from "../components/Navbar.tsx";
import Customers from "@/features/customers";
import CustomerProfile from "@/features/customers/components/CustomerProfile";

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<div className="text-gray-500">Dashboard Home</div>} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
