import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Accounts from "../user/accounts/Accounts";
import Feedback from "../user/feedback/Feedback";
import ChecklistManagement from "../user/checklist/ChecklistManagement";

export default function UserRoutes() {
    // convsole.log(userRole);
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/checklist/daily" replace />} />
            <Route path="/home" element={<Accounts />} />
            <Route path="/feedbacks" element={<Feedback />} />
            <Route path="/feedbacks/:feedbackType" element={<Feedback />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/checklist" element={<ChecklistManagement />} />
            <Route path="/checklist/:checklistType" element={<ChecklistManagement />} />
            <Route path="*" element={<Navigate to="/checklist/daily" replace />} />
        </Routes>
    );
}
