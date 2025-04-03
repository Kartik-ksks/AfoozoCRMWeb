import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Accounts from "../user/accounts/Accounts";
// import FeedbackView from "../common/feedback/FeedbackView";
import Feedback from "../user/feedback/Feedback";
import ChecklistManagement from "../user/checklist/ChecklistManagement";

export default function UserRoutes() {
    // convsole.log(userRole);
    return (
        <Routes>
            <Route path="/" element={<ChecklistManagement />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback/:feedbackType" element={<Feedback />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/checklist" element={<ChecklistManagement />} />
            <Route path="/checklist/:checklistType" element={<ChecklistManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
