import { Request, Response } from 'express';
import * as geminiService from '../services/gemini.service';
import { ChatMessage } from '../../../types';

// Generic error handler
const handleError = (res: Response, error: unknown, defaultMessage: string) => {
    console.error(error);
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(500).json({ error: message });
};

// Generic stream handler
const handleStream = async (res: Response, streamPromise: Promise<AsyncGenerator<string>>) => {
    try {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        const stream = await streamPromise;
        for await (const chunk of stream) {
            res.write(chunk);
        }
        res.end();
    } catch (error) {
        console.error("Streaming error:", error);
        // We can't send a 500 header if the stream has already started.
        // We just end the response. The client will have to handle the abrupt end.
        if (!res.headersSent) {
            res.status(500).send("Error during stream generation.");
        }
        res.end();
    }
};


export const receptionistChat = async (req: Request, res: Response) => {
    const { history } = req.body as { history: ChatMessage[] };
    if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'Invalid "history" property in request body.' });
    }
    await handleStream(res, geminiService.getReceptionistResponseStream(history));
};

export const chatbotStream = async (req: Request, res: Response) => {
    const { history, pageContext } = req.body as { history: ChatMessage[], pageContext?: string };
    if (!history || !Array.isArray(history)) {
        return res.status(400).json({ error: 'Invalid "history" property in request body.' });
    }
    await handleStream(res, geminiService.startChatbotStream(history, pageContext));
};


export const socialPostGenerator = async (req: Request, res: Response) => {
    try {
        const { topic } = req.body;
        if (!topic) {
            return res.status(400).json({ error: 'Missing "topic" in request body.' });
        }
        const result = await geminiService.generateSocialPost(topic);
        res.json({ result });
    } catch (error) {
        handleError(res, error, "Failed to generate social post.");
    }
};

export const newsletterDrafter = async (req: Request, res: Response) => {
    try {
        const { topic, audience } = req.body;
        if (!topic || !audience) {
            return res.status(400).json({ error: 'Missing "topic" or "audience" in request body.' });
        }
        const result = await geminiService.draftNewsletter(topic, audience);
        res.json({ result });
    } catch (error) {
        handleError(res, error, "Failed to draft newsletter.");
    }
};

export const imageGenerator = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Missing "prompt" in request body.' });
        }
        const result = await geminiService.generateImage(prompt);
        res.json({ result });
    } catch (error) {
        handleError(res, error, "Failed to generate image.");
    }
};

export const clientDashboardData = async (req: Request, res: Response) => {
    try {
        const { clientName, plan } = req.query;
        if (!clientName || !plan) {
            return res.status(400).json({ error: 'Missing "clientName" or "plan" query parameters.' });
        }
        const data = await geminiService.generateClientDashboardData(String(clientName), String(plan));
        res.json(data);
    } catch (error) {
        handleError(res, error, "Failed to fetch client dashboard data.");
    }
};

export const adminDashboardStats = async (req: Request, res: Response) => {
    try {
        const data = await geminiService.generateAdminDashboardStats();
        res.json(data);
    } catch (error) {
        handleError(res, error, "Failed to fetch admin dashboard stats.");
    }
};

export const impersonateClient = (req: Request, res: Response) => {
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