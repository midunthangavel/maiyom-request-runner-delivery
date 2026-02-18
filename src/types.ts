export type MissionScenario = "traveling" | "event" | "urgent";
export type MissionStatus = "open" | "offered" | "accepted" | "in_transit" | "delivered";
export type OfferStatus = "pending" | "accepted" | "rejected";

export interface Mission {
    id: string;
    requester_id: string; // Changed from requesterId to match typically snake_case DB or keep camelCase if we map it
    title: string;
    description: string;
    scenario: MissionScenario;
    from_location: string; // db: from_location
    to_location: string; // db: to_location
    delivery_location: string; // db: delivery_location
    arrival_time: string; // db: arrival_time
    budget_min: number; // db: budget_min
    budget_max: number; // db: budget_max
    status: MissionStatus;
    category: string;
    distance?: string;
    created_at: string;
    image_url?: string;
    lat?: number;
    lng?: number;
}

// Keeping original camelCase aliases for easier refactoring if we transform data
export interface MissionDisplay extends Omit<Mission, 'requester_id' | 'from_location' | 'to_location' | 'delivery_location' | 'arrival_time' | 'budget_min' | 'budget_max' | 'created_at' | 'image_url'> {
    requesterId: string;
    from: string;
    to: string;
    deliveryLocation: string;
    arrivalTime: string;
    budgetMin: number;
    budgetMax: number;
    createdAt: string;
    imageUrl?: string;
}

export interface Runner {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completed_missions: number;
    verification_level: 1 | 2 | 3;
    city: string;
    earnings_today: number;
    earnings_weekly: number;
    streak: number;
}

export interface RunnerDisplay extends Omit<Runner, 'completed_missions' | 'verification_level' | 'earnings_today' | 'earnings_weekly'> {
    completedMissions: number;
    verificationLevel: 1 | 2 | 3;
    earnings: { today: number; weekly: number };
}

export interface Offer {
    id: string;
    mission_id: string;
    runner_id: string;
    price: number;
    note: string;
    item_photo_url?: string;
    status: OfferStatus;
    created_at: string;
}

export interface OfferDisplay extends Omit<Offer, 'mission_id' | 'runner_id' | 'item_photo_url' | 'created_at'> {
    missionId: string;
    runnerId: string;
    itemPhotoUrl?: string;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    sender_id: string;
    text: string;
    created_at: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    role: "requester" | "runner" | "both";
    city?: string;
    location?: string;
    dob?: string;
    aadhaar_verified: boolean;
    rating?: number;
    completed_missions?: number;
    verification_level?: number;
    created_at: string;
}

export interface Conversation {
    id: string; // usually mission_id
    participantName: string;
    participantAvatar?: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    missionTitle?: string;
    status: "active" | "completed";
}

export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    body: string;
    time: string; // or createdAt
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    actionUrl?: string; // or action_url
    // For compatibility with Supabase 'created_at'
    createdAt?: string;
}
