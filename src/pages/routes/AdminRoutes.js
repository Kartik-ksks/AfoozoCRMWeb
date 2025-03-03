import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../admin/home/Home";
import Masters from "../admin/master/Masters";
import Feedback from "../admin/feedback/Feedback";
import ChecklistManagement from "../admin/checklist/ChecklistManagement";
import ChecklistSubmissions from "../admin/checklist/ChecklistSubmissions";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/masters/:master" element={<Masters />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback/:feedbackType" element={<Feedback />} />
            <Route path="/checklist" element={<ChecklistManagement />} />
            <Route path="/checklist/:checklistType" element={<ChecklistManagement />} />
            <Route path="/checklist/submissions" element={<ChecklistSubmissions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
