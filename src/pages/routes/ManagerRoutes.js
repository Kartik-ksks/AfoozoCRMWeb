import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../manager/home/Home";
import Masters from "../manager/master/Masters";
import CategoryTable from "../admin/master/sitecategories/CategoryTable";
import FeedbackView from "../common/feedback/FeedbackView";

export default function ManagerRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/masters/:master" element={<Masters />} />
            <Route path="/masters" element={<Masters />} />
            <Route path="/site-categories" element={<CategoryTable />} />
            <Route path="/feedback" element={<FeedbackView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
