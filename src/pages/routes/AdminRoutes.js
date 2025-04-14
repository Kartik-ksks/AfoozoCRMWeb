import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../admin/home/Home";
import Masters from "../admin/master/Masters";
import Feedback from "../admin/feedback/Feedback";
import ChecklistManagement from "../admin/checklist/ChecklistManagement";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/masters/:master" element={<Masters />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/feedbacks" element={<Feedback />} />
            <Route path="/feedbacks/:feedbackType" element={<Feedback />} />
            <Route path="/checklist" element={<ChecklistManagement />} />
            <Route path="/checklist/:checklistType" element={<ChecklistManagement />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}
