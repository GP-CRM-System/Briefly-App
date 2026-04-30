import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "../core/layouts/Dashboard";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import LandingPage from "../pages/landing/Landing";

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}
