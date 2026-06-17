import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "@/core/components";
import Dashboard from "@/core/layouts/Dashboard";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import LandingPage from "@/pages/landing/Landing";
import Onboarding from "@/pages/onboarding/Onboarding";
import NotFoundPage from "@/pages/NotFoundPage";
import AuthCallback from "@/pages/auth/AuthCallback";
import AcceptInvitation from "@/pages/auth/AcceptInvitation";
import TeamPage from "@/pages/team/page";

/**
 * Resets scroll position to top whenever the route pathname changes.
 * Uses "instant" so there's no visible scroll animation competing with
 * hash-link smooth scrolling. Hash-only changes (e.g. /#about → /#pricing
 * on the same page) do NOT trigger this because pathname doesn't change.
 */
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname]);
    return null;
}

export default function AppRouter() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/team" element={<TeamPage />} />

                {/* Guest only — logged-in users get redirected to /dashboard */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
                <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
                <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/accept-invitation" element={<AcceptInvitation />} />

                {/* Protected — unauthenticated users get redirected to /login */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}
