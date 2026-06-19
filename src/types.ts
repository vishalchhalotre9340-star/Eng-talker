export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ScheduleItemData {
    type: 'Social Post' | 'Newsletter';
    title: string;
    date: string;
    status: 'Scheduled' | 'Queued' | 'Draft';
}

export interface DashboardStats {
    appointmentsBooked: number;
    socialPostsThisWeek: string;
    nextNewsletterDate: string;
    monthlyROI: number;
}

export interface DashboardData {
    stats: DashboardStats;
    schedule: ScheduleItemData[];
}

export interface AdminStats {
    activeClients: number;
    platformStatus: string;
    aiInteractionsToday: number;
}
