import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../admin/home/Home";
import Masters from "../admin/master/Masters";
import FeedbackView from "../common/feedback/FeedbackView";


export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/masters/:master" element={<Masters />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/feedback" element={<FeedbackView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

    );
}
