import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/core/components";
import Dashboard from "@/core/layouts/Dashboard";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import LandingPage from "@/pages/landing/Landing";
import Onboarding from "@/pages/onboarding/Onboarding";
import NotFoundPage from "@/pages/NotFoundPage";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />

                {/* Guest only — logged-in users get redirected to /dashboard */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
                <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />

                {/* Protected — unauthenticated users get redirected to /login */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}
