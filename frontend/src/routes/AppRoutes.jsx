import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Reimbursements from "../pages/Reimbursements";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/reimbursements" element={<Reimbursements />} />
        </Routes>
    );
}