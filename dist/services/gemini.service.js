"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAdminDashboardStats = exports.generateClientDashboardData = exports.generateImage = exports.draftNewsletter = exports.generateSocialPost = exports.startChatbotStream = exports.getReceptionistResponseStream = void 0;
const genai_1 = require("@google/genai");
let ai = null;
const getAI = () => {
    if (!ai) {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            throw new Error("The API_KEY environment variable is not set.");
        }
        ai = new genai_1.GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};
const buildHistory = (history) => {
    return history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
};
const requireText = (response) => {
    if (!response.text) {
        throw new Error("Gemini returned an empty text response.");
    }
    return response.text;
};
const textToStream = async function* (result) {
    for await (const chunk of result) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
};
const getReceptionistResponseStream = async (history) => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are Amunet, an AI receptionist for "Sample MedSpa". Your tone is professional, warm, and not salesy. Your goal is to help potential clients book an appointment.
                When a user wants to book, ask for the following information if they haven't provided it:
                1. The service they are interested in (e.g., chemical peel, laser hair removal).
                2. Their preferred date and time for an appointment.
                3. Their full name and phone number.
                After gathering the information, confirm the appointment details with them. Do not make up available times; instead, say "Let me check our calendar for that time." and then confirm it's available.
                Keep your responses brief and helpful.`;
    const contents = buildHistory(history);
    const result = await getAI().models.generateContentStream({
        model,
        contents,
        config: { systemInstruction }
    });
    return textToStream(result);
};
exports.getReceptionistResponseStream = getReceptionistResponseStream;
const getContextualSystemInstruction = (pageContext) => {
    const knowledgeBase = `
# Amunet AI Chatbot Knowledge Base

## 1. Brand Personality & Tone
- **Your Persona:** You are Amunet, a confident, professional, and helpful AI assistant for the Amunet AI SaaS product.
- **Tone:** Your tone is never robotic. It's benefit-driven and knowledgeable. Frame answers around saving time and increasing revenue.
- **Style:** Keep answers short and to the point. Example: "Here’s how Amunet saves you 10+ hours a week."
- **Visual Identity:** The brand is futuristic and Egyptian-themed (Eye of Ra, neon purple). While you can't show visuals, this theme should inform your confident and almost all-knowing persona.

## 2. Core Product Knowledge
- **Purpose:** Amunet AI is an all-in-one AI receptionist, social media manager, and newsletter assistant for service-based businesses (like law firms, realtors, medspas, dentists).
- **Key Benefit:** We save businesses time and prevent lost revenue from missed calls or inconsistent marketing.
- **Primary Features:**
    - **AI Receptionist:** Answers calls/SMS 24/7, books appointments, and syncs with Google, Outlook, and Calendly.
    - **Social Media Manager:** Creates and schedules text and image posts for Instagram, Facebook, LinkedIn, and Google Business.
    - **Newsletter Assistant:** Drafts branded monthly newsletters to engage clients.
    - **Analytics Dashboard:** Shows ROI, lead capture rates, and engagement.

## 3. Sales Knowledge & Pain Points
- **Pain Points to Address:**
    - Missed calls = lost money.
    - Manual booking and social media posting take hours.
    - Inconsistent client engagement hurts repeat business.
    - Hiring 3 different people costs much more than Amunet.
- **Sales Angles to Use:**
    - **ROI Framing:** "A single new client recovered by Amunet can pay for the service many times over."
    - **Time Framing:** "Business owners can reclaim 15+ hours per week."
    - **Reliability:** "Amunet is your 24/7 employee who never calls in sick."
- **Demo Guidance:** Always encourage users to try the Playground. "Would you like me to show you how Amunet answers a call or writes a social media post for a business like yours?"
- **Call to Action (CTA):** End conversations with a CTA, like "You can calculate your potential savings with our ROI calculator" or "Why not start your free demo today?"

## 4. Pricing & Plans
- **Core Plan:** $777/month. Includes AI receptionist, calendar sync, 5 social posts/week, 1 newsletter/month.
- **Growth Plan:** $997/month. Everything in Core, plus more posts (2/day), more newsletters (4/month), and multi-location support.
- **Enterprise Plan:** Custom pricing. Includes everything in Growth, plus advanced analytics, white-labeling, and dedicated support.
- **Trial:** All plans have a 7-day free trial.
- **Integrations:** Twilio (for calls/SMS), Stripe (for billing), Google Calendar, SendGrid (for newsletters), Meta platforms, LinkedIn.

## 5. Proactive Intelligence & Intent Detection
- **If user asks about pricing:** Respond with the plan breakdown and suggest they use the ROI calculator.
- **If user mentions their industry (e.g., "I'm a dentist"):** Tailor your response. "Amunet is perfect for dentists. It can book appointments for cleanings 24/7, send reminders, and post dental health tips to your social media, all automatically."
- **If user seems lost or is exploring:** Invite them to the Playground demo.
- **If user mentions they are already a client:** Offer help with scheduling or integrations.
- **If you don't know:** Say, "That's an excellent question. While I don't have the specific details on that, our support team would be happy to help."
`;
    let contextSpecificInstruction = '';
    switch (pageContext) {
        case 'pricing':
            contextSpecificInstruction = `The user is currently on the pricing page. Be ready to answer specific questions comparing the Core ($777/mo) and Growth ($997/mo) plans. This is a great time to mention the ROI calculator.`;
            break;
        case 'roi-calculator':
            contextSpecificInstruction = `The user is on the ROI calculator page. Proactively offer to explain how it works or what the inputs mean. Connect the results to the value of the monthly plans.`;
            break;
        case 'playground':
            contextSpecificInstruction = `The user is on the Playground page. They are testing the features. Offer tips or answer questions about the AI Receptionist, Social Media, or Newsletter tools. Encourage them to see how it would work for *their* business.`;
            break;
        case 'signup':
        case 'login':
            contextSpecificInstruction = `The user is on the sign-up or login page. They might have questions about the 7-day free trial, account creation, or what happens after they sign up.`;
            break;
        default:
            contextSpecificInstruction = 'The user is on one of the main marketing pages. Your goal is to guide them toward the Playground, Pricing, or the ROI Calculator.';
            break;
    }
    return `${knowledgeBase}\n\n---\n\n**YOUR CURRENT TASK:**\nYou are chatting with a user. Use the knowledge base above to answer their questions. Be helpful, concise, and stay in character as Amunet.\n**CURRENT CONTEXT:** ${contextSpecificInstruction}`;
};
const startChatbotStream = async (history, pageContext) => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = getContextualSystemInstruction(pageContext);
    const contents = buildHistory(history);
    const result = await getAI().models.generateContentStream({
        model,
        contents,
        config: { systemInstruction }
    });
    return textToStream(result);
};
exports.startChatbotStream = startChatbotStream;
const generateSocialPost = async (topic) => {
    const prompt = `Generate 4 distinct social media posts for a medspa named "Sample MedSpa" based on the following topic: "${topic}".
    Provide one for Twitter (X), one for Instagram, one for LinkedIn, and one for Google Business Profile.
    - Twitter: Keep it short, under 280 characters, and include relevant hashtags.
    - Instagram: Write an engaging caption, suggest a visual, and include popular, relevant hashtags for the beauty/wellness industry.
    - LinkedIn: Make it professional, focusing on the science or wellness benefits, and end with a question to encourage discussion.
    - Google Business Profile: Write a concise and informative update about the spa or a special offer.
    Format the output clearly with headings for each platform.`;
    const result = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return requireText(result);
};
exports.generateSocialPost = generateSocialPost;
const draftNewsletter = async (topic, audience) => {
    const prompt = `Draft a compelling monthly recap newsletter for "Sample MedSpa".
    Theme/Topic for this month: "${topic}".
    Target Audience: "${audience}".
    The newsletter should have the following structure:
    1. A catchy Subject Line.
    2. A brief, engaging introduction.
    3. The main body content, expanding on the monthly topic with valuable skincare/wellness information or spa updates (use 2-3 paragraphs).
    4. A clear call-to-action (e.g., "Book Your Treatment," "Shop Our Summer Skincare Line").
    5. A friendly sign-off.
    Format the output as simple, clean HTML using <h2> for titles, <p> for paragraphs, and <ul>/<li> for lists. Do not include <!DOCTYPE html>, <html>, or <body> tags.`;
    const result = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return requireText(result);
};
exports.draftNewsletter = draftNewsletter;
const generateImage = async (prompt) => {
    const response = await getAI().models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A professional, modern, and clean image for a medspa. Style: bright, airy, minimalist, with colors of soft white, beige, and light green. The image should convey relaxation, wellness, and expertise. Prompt: ${prompt}`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        },
    });
    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("Sorry, I couldn't generate an image. The response was empty.");
};
exports.generateImage = generateImage;
const generateClientDashboardData = async (clientName, plan) => {
    const prompt = `You are the backend for Amunet AI. For the client "${clientName}", generate a realistic JSON object for their dashboard. The client is on the "${plan}" plan. The current date is ${new Date().toDateString()}.
    Generate plausible data for the stats and a schedule with 4 upcoming items.`;
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: genai_1.Type.OBJECT,
                properties: {
                    stats: {
                        type: genai_1.Type.OBJECT,
                        properties: {
                            appointmentsBooked: { type: genai_1.Type.INTEGER, description: "Number of appointments booked this month." },
                            socialPostsThisWeek: { type: genai_1.Type.STRING, description: "Social posts this week, e.g., '3 / 14'." },
                            nextNewsletterDate: { type: genai_1.Type.STRING, description: "Date of the next newsletter, e.g., 'July 31st'." },
                            monthlyROI: { type: genai_1.Type.NUMBER, description: "Estimated monthly ROI in USD." }
                        },
                        required: ["appointmentsBooked", "socialPostsThisWeek", "nextNewsletterDate", "monthlyROI"]
                    },
                    schedule: {
                        type: genai_1.Type.ARRAY,
                        items: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                type: { type: genai_1.Type.STRING, enum: ['Social Post', 'Newsletter'] },
                                title: { type: genai_1.Type.STRING },
                                date: { type: genai_1.Type.STRING, description: "Full date and time, e.g., 'July 15, 9:00 AM'" },
                                status: { type: genai_1.Type.STRING, enum: ['Scheduled', 'Queued', 'Draft'] }
                            },
                            required: ["type", "title", "date", "status"]
                        }
                    }
                },
                required: ["stats", "schedule"]
            }
        }
    });
    const jsonStr = requireText(response).trim();
    return JSON.parse(jsonStr);
};
exports.generateClientDashboardData = generateClientDashboardData;
const generateAdminDashboardStats = async () => {
    const prompt = `You are the backend for Amunet AI. Generate a realistic JSON object for the admin dashboard stats. The JSON should include activeClients (a number between 1000 and 1500), platformStatus ('All Systems Online'), and aiInteractionsToday (a number between 30000 and 50000).`;
    const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: genai_1.Type.OBJECT,
                properties: {
                    activeClients: { type: genai_1.Type.INTEGER },
                    platformStatus: { type: genai_1.Type.STRING },
                    aiInteractionsToday: { type: genai_1.Type.INTEGER }
                },
                required: ["activeClients", "platformStatus", "aiInteractionsToday"]
            }
        }
    });
    const jsonStr = requireText(response).trim();
    return JSON.parse(jsonStr);
};
exports.generateAdminDashboardStats = generateAdminDashboardStats;
