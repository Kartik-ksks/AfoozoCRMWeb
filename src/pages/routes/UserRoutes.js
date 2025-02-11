import React, { useContext } from "react";
import { SessionContext } from "../../context/session";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../user/home/Home";
import Accounts from "../user/accounts/Accounts";
// import FeedbackView from "../common/feedback/FeedbackView";
import Feedback from "../user/feedback/Feedback";

export default function UserRoutes() {
    const { userRole } = useContext(SessionContext);
    console.log(userRole);
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
