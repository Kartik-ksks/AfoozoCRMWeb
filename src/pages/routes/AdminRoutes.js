import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../admin/home/Home";
import Masters from "../admin/master/Masters";
import Feedback from "../admin/feedback/Feedback";

export default function AdminRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/masters/:master" element={<Masters />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/feedback/:feedbackType" element={<Feedback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
