"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const amunet_controller_1 = require("../controllers/amunet.controller");
const router = (0, express_1.Router)();
// --- Mock Authentication Middleware ---
// In a real app, this would involve token validation (e.g., JWT) and user role lookup.
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // For this mock, any bearer token is considered a valid "client" session.
        return next();
    }
    res.status(401).json({ error: 'Unauthorized: A valid bearer token is required.' });
};
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer admin-token') {
        // Only a specific token grants admin access.
        return next();
    }
    res.status(403).json({ error: 'Forbidden: Administrator privileges are required.' });
};
// --- Public Endpoints (No Auth Required) ---
router.post('/receptionist-chat', amunet_controller_1.receptionistChat);
router.post('/chatbot-stream', amunet_controller_1.chatbotStream);
router.post('/social-post', amunet_controller_1.socialPostGenerator);
router.post('/newsletter', amunet_controller_1.newsletterDrafter);
router.post('/image', amunet_controller_1.imageGenerator);
// --- Client Endpoints (Client Auth Required) ---
router.get('/client-dashboard', requireAuth, amunet_controller_1.clientDashboardData);
// --- Admin Endpoints (Admin Auth Required) ---
router.get('/admin-dashboard', requireAdmin, amunet_controller_1.adminDashboardStats);
router.post('/admin/impersonate', requireAdmin, amunet_controller_1.impersonateClient);
exports.default = router;
