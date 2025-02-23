import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../manager/home/Home";
import Masters from "../manager/master/Masters";
import Feedback from "../manager/feedback/Feedback";

export default function ManagerRoutes() {
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
