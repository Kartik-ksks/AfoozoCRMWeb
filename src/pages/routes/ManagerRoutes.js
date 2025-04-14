import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../manager/home/Home";
import Masters from "../manager/master/Masters";
import Feedback from "../manager/feedback/Feedback";
import ChecklistManagement from "../manager/checklist/ChecklistManagement";
import Accounts from "../user/accounts/Accounts";


export default function ManagerRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/checklist/daily" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/masters/:master" element={<Masters />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/feedbacks" element={<Feedback />} />
            <Route path="/feedbacks/:feedbackType" element={<Feedback />} />
            <Route path="/checklist" element={<ChecklistManagement />} />
            <Route path="/checklist/:checklistType" element={<ChecklistManagement />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="*" element={<Navigate to="/checklist/daily" replace />} />
        </Routes>
    );
}
