import React, { useContext } from "react";
import { SessionContext } from "../../context/session";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../user/home/Home";
import Accounts from "../user/accounts/Accounts";
// import FeedbackView from "../common/feedback/FeedbackView";
import Feedback from "../user/feedback/Feedback";
import Checklist from "../user/checklist/Checklist";

export default function UserRoutes() {
    const { userRole } = useContext(SessionContext);
    // convsole.log(userRole);
    return (
        <Routes>
            <Route path="/" element={<Accounts />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback/:feedbackType" element={<Feedback />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/checklist/:siteId" element={<Checklist />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
