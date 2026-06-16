import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/core/components";
import Dashboard from "@/core/layouts/Dashboard";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import LandingPage from "@/pages/landing/Landing";
import Onboarding from "@/pages/onboarding/Onboarding";
import AuthCallback from "@/pages/auth/AuthCallback";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />

                {/* Guest only — logged-in users get redirected to /dashboard */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Protected — unauthenticated users get redirected to /login */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}
