export type MissionScenario = "traveling" | "event" | "urgent";
export type MissionStatus = "open" | "offered" | "accepted" | "in_transit" | "delivered";
export type OfferStatus = "pending" | "accepted" | "rejected";

export interface Mission {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  scenario: MissionScenario;
  from: string;
  to: string;
  deliveryLocation: string;
  arrivalTime: string;
  budgetMin: number;
  budgetMax: number;
  status: MissionStatus;
  category: string;
  distance?: string;
  createdAt: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
}

export interface Runner {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  completedMissions: number;
  verificationLevel: 1 | 2 | 3;
  city: string;
  earnings: { today: number; weekly: number };
  streak: number;
}

export interface Offer {
  id: string;
  missionId: string;
  runnerId: string;
  price: number;
  note: string;
  itemPhotoUrl?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export const mockRunners: Runner[] = [
  {
    id: "r1",
    name: "Arjun Mehta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    rating: 4.8,
    completedMissions: 142,
    verificationLevel: 3,
    city: "Chennai",
    earnings: { today: 780, weekly: 4250 },
    streak: 7,
  },
  {
    id: "r2",
    name: "Priya Sharma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    rating: 4.9,
    completedMissions: 89,
    verificationLevel: 2,
    city: "Bengaluru",
    earnings: { today: 450, weekly: 3100 },
    streak: 4,
  },
  {
    id: "r3",
    name: "Karthik R.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karthik",
    rating: 4.6,
    completedMissions: 56,
    verificationLevel: 2,
    city: "Mumbai",
    earnings: { today: 320, weekly: 2800 },
    streak: 2,
  },
];

export const mockMissions: Mission[] = [
  {
    id: "m1",
    requesterId: "u1",
    title: "Flowers + Gift Box",
    description: "Need a bouquet of fresh roses and a gift-wrapped chocolate box delivered at Platform 3. It's my mom's birthday and I'm arriving by Shatabdi Express.",
    scenario: "traveling",
    from: "Bengaluru",
    to: "Chennai Central",
    deliveryLocation: "Platform 3, Chennai Central Railway Station",
    arrivalTime: "Today, 6:00 PM",
    budgetMin: 500,
    budgetMax: 800,
    status: "open",
    category: "Gifts",
    distance: "2.3 km",
    createdAt: "2 hrs ago",
    lat: 13.0827,
    lng: 80.2750,
  },
  {
    id: "m2",
    requesterId: "u2",
    title: "Urgent BP Medicine",
    description: "Need Amlodipine 5mg tablets urgently. Father forgot his medication. Flight lands at 11 PM. Need it at arrivals gate.",
    scenario: "urgent",
    from: "Delhi",
    to: "Bengaluru Airport",
    deliveryLocation: "Arrivals Gate 2, Kempegowda International Airport",
    arrivalTime: "Today, 11:00 PM",
    budgetMin: 200,
    budgetMax: 400,
    status: "offered",
    category: "Medicine",
    distance: "5.1 km",
    createdAt: "45 min ago",
    lat: 13.1986,
    lng: 77.7066,
  },
  {
    id: "m3",
    requesterId: "u3",
    title: "Local Snacks Pack",
    description: "Want a pack of Mysore Pak, Murukku, and filter coffee powder from a local store. Attending a conference and want to gift colleagues.",
    scenario: "event",
    from: "Hyderabad",
    to: "Chennai",
    deliveryLocation: "ITC Grand Chola, Lobby",
    arrivalTime: "Tomorrow, 10:00 AM",
    budgetMin: 600,
    budgetMax: 1000,
    status: "open",
    category: "Food",
    distance: "3.8 km",
    createdAt: "1 hr ago",
    lat: 13.0103,
    lng: 80.2269,
  },
  {
    id: "m4",
    requesterId: "u1",
    title: "Phone Charger (USB-C)",
    description: "Left my charger at home. Need a 65W USB-C charger before my meeting at 3 PM.",
    scenario: "urgent",
    from: "Mumbai",
    to: "Mumbai",
    deliveryLocation: "WeWork BKC, 5th Floor Reception",
    arrivalTime: "Today, 2:30 PM",
    budgetMin: 300,
    budgetMax: 600,
    status: "accepted",
    category: "Electronics",
    distance: "1.2 km",
    createdAt: "30 min ago",
    lat: 19.0596,
    lng: 72.8656,
  },
];

export const mockOffers: Offer[] = [
  {
    id: "o1",
    missionId: "m2",
    runnerId: "r1",
    price: 350,
    note: "Found Amlodipine 5mg at Apollo Pharmacy near the airport. Can reach Gate 2 by 10:45 PM.",
    status: "pending",
    createdAt: "20 min ago",
  },
  {
    id: "o2",
    missionId: "m2",
    runnerId: "r2",
    price: 300,
    note: "Available near airport. Will pick up from MedPlus and be there by 10:50 PM.",
    status: "pending",
    createdAt: "15 min ago",
  },
];

export const mockChatMessages: ChatMessage[] = [
  { id: "c1", senderId: "u1", text: "Hi! Have you found the charger?", timestamp: "2:05 PM" },
  { id: "c2", senderId: "r1", text: "Yes! Got a Realme 65W charger from Croma. On my way now 🏃", timestamp: "2:08 PM" },
  { id: "c3", senderId: "u1", text: "Perfect, I'm at the reception desk", timestamp: "2:10 PM" },
  { id: "c4", senderId: "r1", text: "Be there in 10 mins!", timestamp: "2:11 PM" },
];

export const scenarioIcons: Record<MissionScenario, string> = {
  traveling: "🚆",
  event: "🎪",
  urgent: "⚡",
};

export const scenarioLabels: Record<MissionScenario, string> = {
  traveling: "Traveling",
  event: "Event",
  urgent: "Urgent",
};

// ─── Notifications ───────────────────────────────────────

export type NotificationType = "offer_received" | "offer_accepted" | "mission_update" | "delivery" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  missionTitle?: string;
}

export const notificationIcons: Record<NotificationType, string> = {
  offer_received: "💰",
  offer_accepted: "✅",
  mission_update: "📋",
  delivery: "📦",
  system: "🔔",
};

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "offer_received",
    title: "New offer on Flowers + Gift Box",
    body: "Arjun Mehta offered ₹350 — \"Found fresh roses at nearby shop\"",
    timestamp: "5 min ago",
    read: false,
    actionUrl: "/mission/m1",
  },
  {
    id: "n2",
    type: "offer_received",
    title: "New offer on Urgent BP Medicine",
    body: "Priya Sharma offered ₹300 — \"Available near airport, can reach by 10:50 PM\"",
    timestamp: "15 min ago",
    read: false,
    actionUrl: "/mission/m2",
  },
  {
    id: "n3",
    type: "offer_accepted",
    title: "Offer accepted!",
    body: "Your offer for Phone Charger (USB-C) was accepted by the requester",
    timestamp: "30 min ago",
    read: false,
    actionUrl: "/mission/m4",
  },
  {
    id: "n4",
    type: "mission_update",
    title: "Mission status update",
    body: "Phone Charger (USB-C) is now in transit. Runner is on the way!",
    timestamp: "45 min ago",
    read: true,
    actionUrl: "/tracking/m4",
  },
  {
    id: "n5",
    type: "delivery",
    title: "Delivery completed!",
    body: "Local Snacks Pack was successfully delivered. Rate your runner!",
    timestamp: "2 hrs ago",
    read: true,
    actionUrl: "/rate/m3",
  },
  {
    id: "n6",
    type: "system",
    title: "Welcome to Maiyom! 🎉",
    body: "Your account is set up. Start by creating your first mission or browsing the runner feed.",
    timestamp: "3 hrs ago",
    read: true,
  },
  {
    id: "n7",
    type: "system",
    title: "Complete your verification",
    body: "Verify your Aadhaar to unlock Level 3 and earn more as a runner.",
    timestamp: "1 day ago",
    read: true,
    actionUrl: "/profile",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participantId: "r1",
    participantName: "Arjun Mehta",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun",
    lastMessage: "Be there in 10 mins!",
    timestamp: "2:11 PM",
    unreadCount: 2,
    missionTitle: "Phone Charger (USB-C)",
  },
  {
    id: "conv2",
    participantId: "r2",
    participantName: "Priya Sharma",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    lastMessage: "I found Amlodipine 5mg at Apollo Pharmacy",
    timestamp: "1:45 PM",
    unreadCount: 1,
    missionTitle: "Urgent BP Medicine",
  },
  {
    id: "conv3",
    participantId: "r3",
    participantName: "Karthik R.",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karthik",
    lastMessage: "Delivered the snacks pack. Thank you!",
    timestamp: "Yesterday",
    unreadCount: 0,
    missionTitle: "Local Snacks Pack",
  },
];
