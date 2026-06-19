import { Router, Request, Response, NextFunction } from 'express';
import {
    receptionistChat,
    chatbotStream,
    socialPostGenerator,
    newsletterDrafter,
    imageGenerator,
    clientDashboardData,
    adminDashboardStats,
    impersonateClient
} from '../controllers/amunet.controller';

const router = Router();

// --- Mock Authentication Middleware ---
// In a real app, this would involve token validation (e.g., JWT) and user role lookup.

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // For this mock, any bearer token is considered a valid "client" session.
        return next();
    }
    res.status(401).json({ error: 'Unauthorized: A valid bearer token is required.' });
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer admin-token') {
        // Only a specific token grants admin access.
        return next();
    }
    res.status(403).json({ error: 'Forbidden: Administrator privileges are required.' });
};


// --- Public Endpoints (No Auth Required) ---
router.post('/receptionist-chat', receptionistChat);
router.post('/chatbot-stream', chatbotStream);
router.post('/social-post', socialPostGenerator);
router.post('/newsletter', newsletterDrafter);
router.post('/image', imageGenerator);

// --- Client Endpoints (Client Auth Required) ---
router.get('/client-dashboard', requireAuth, clientDashboardData);

// --- Admin Endpoints (Admin Auth Required) ---
router.get('/admin-dashboard', requireAdmin, adminDashboardStats);
router.post('/admin/impersonate', requireAdmin, impersonateClient);


export default router;