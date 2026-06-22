"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.impersonateClient = exports.adminDashboardStats = exports.clientDashboardData = exports.imageGenerator = exports.newsletterDrafter = exports.socialPostGenerator = exports.chatbotStream = exports.receptionistChat = void 0;
const geminiService = __importStar(require("../services/gemini.service"));
// Generic error handler
const handleError = (res, error, defaultMessage) => {
    console.error(error);
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(500).json({ error: message });
};
// Generic stream handler
const handleStream = async (res, streamPromise) => {
    try {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        const stream = await streamPromise;
        for await (const chunk of stream) {
            res.write(chunk);
        }
        res.end();
    }
    catch (error) {
        console.error("Streaming error:", error);
        // We can't send a 500 header if the stream has already started.
        // We just end the response. The client will have to handle the abrupt end.
        if (!res.headersSent) {
            res.status(500).send("Error during stream generation.");
        }
        res.end();
    }
};
const receptionistChat = async (req, res) => {
    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'Invalid "history" property in request body.' });
    }
    await handleStream(res, geminiService.getReceptionistResponseStream(history));
};
exports.receptionistChat = receptionistChat;
const chatbotStream = async (req, res) => {
    const { history, pageContext } = req.body;
    if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'Invalid "history" property in request body.' });
    }
    await handleStream(res, geminiService.startChatbotStream(history, pageContext));
};
exports.chatbotStream = chatbotStream;
const socialPostGenerator = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Missing "topic" in request body.' });
        }
        const result = await geminiService.generateSocialPost(topic);
        res.json({ result });
    }
    catch (error) {
        handleError(res, error, "Failed to generate social post.");
    }
};
exports.socialPostGenerator = socialPostGenerator;
const newsletterDrafter = async (req, res) => {
    try {
        const { topic, audience } = req.body;
        if (!topic || !audience) {
            return res.status(400).json({ error: 'Missing "topic" or "audience" in request body.' });
        }
        const result = await geminiService.draftNewsletter(topic, audience);
        res.json({ result });
    }
    catch (error) {
        handleError(res, error, "Failed to draft newsletter.");
    }
};
exports.newsletterDrafter = newsletterDrafter;
const imageGenerator = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Missing "prompt" in request body.' });
        }
        const result = await geminiService.generateImage(prompt);
        res.json({ result });
    }
    catch (error) {
        handleError(res, error, "Failed to generate image.");
    }
};
exports.imageGenerator = imageGenerator;
const clientDashboardData = async (req, res) => {
    try {
        const { clientName, plan } = req.query;
        if (!clientName || !plan) {
            return res.status(400).json({ error: 'Missing "clientName" or "plan" query parameters.' });
        }
        const data = await geminiService.generateClientDashboardData(String(clientName), String(plan));
        res.json(data);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch client dashboard data.");
    }
};
exports.clientDashboardData = clientDashboardData;
const adminDashboardStats = async (req, res) => {
    try {
        const data = await geminiService.generateAdminDashboardStats();
        res.json(data);
    }
    catch (error) {
        handleError(res, error, "Failed to fetch admin dashboard stats.");
    }
};
exports.adminDashboardStats = adminDashboardStats;
const impersonateClient = (req, res) => {
    const { clientName } = req.body;
    if (!clientName) {
        return res.status(400).json({ error: 'Missing "clientName" in request body.' });
    }
    // In a real application, this would generate a temporary, scoped JWT or session
    // allowing the admin to act as the specified client.
    res.json({
        success: true,
        message: `Impersonation session for ${clientName} would be initiated here.`,
    });
};
exports.impersonateClient = impersonateClient;
