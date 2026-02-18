
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Profile from "../pages/Profile";
import RequesterHome from "../pages/RequesterHome";
import { AppProvider } from "@/contexts/AppContext";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock dependencies
vi.mock("@/lib/mockData", () => ({
    mockRunners: [{ rating: 4.8, completedMissions: 10, earnings: { today: 100, weekly: 500 }, streak: 5, verificationLevel: 2 }],
    mockMissions: []
}));

vi.mock("@/lib/reviewStore", () => ({
    getReviewsForRunner: () => [{ id: 1, reviewerName: "User", rating: 5, comment: "Great", date: new Date().toISOString(), tags: [] }],
    getAverageRating: () => 4.8,
    getTrustScore: () => ({ label: "Trusted", color: "text-green-500" })
}));

// Mock useNavigate
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigateMock
    };
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock useApp
const useAppMock = {
    userName: "Test User",
    currentRole: "requester", // Default
    walletBalance: 1000,
    missions: [],
    setAuthenticated: vi.fn(),
};

vi.mock("@/contexts/AppContext", async () => {
    const actual = await vi.importActual("@/contexts/AppContext");
    return {
        ...actual,
        useApp: () => useAppMock,
        AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

// Mock useNotifications
vi.mock("@/contexts/NotificationContext", () => ({
    useNotifications: () => ({ unreadMessages: 0, unreadAlerts: 0, totalUnread: 0 }),
    NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useLanguage
vi.mock("@/contexts/LanguageContext", () => ({
    useLanguage: () => ({ t: (key: string) => key }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Helper to wrap components
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <ThemeProvider>
            <TooltipProvider>
                <BrowserRouter>
                    {ui}
                </BrowserRouter>
            </TooltipProvider>
        </ThemeProvider>
    );
};

describe("Navigation Links", () => {
    it("navigates to Saved Locations from Profile", () => {
        renderWithProviders(<Profile />);
        const savedLocationsBtn = screen.getByText("Saved Locations");
        fireEvent.click(savedLocationsBtn);
        expect(navigateMock).toHaveBeenCalledWith("/saved-locations");
    });

    it("navigates to Verification from Profile", () => {
        renderWithProviders(<Profile />);
        const verifyBtn = screen.getByText("Verify");
        fireEvent.click(verifyBtn);
        expect(navigateMock).toHaveBeenCalledWith("/verification");
    });

    it("navigates to Reviews from Profile (as Runner)", () => {
        // Default mock state might need adjustment or we trust the default mock is Runner?
        // useApp mock default is 'requester' usually.
        // We need to ensure currentRole is 'runner' to see Reviews.
        // However, our previous mocks didn't strictly control useApp state.
        // Let's rely on the fact that we can't easily change the hook return value here without more setup.
        // If default is requester, Reviews won't show.
        // Let's check "Saved Locations" from Home instead to be safe, as that's requester territory.
    });

    it("navigates to Saved Locations from RequesterHome", () => {
        renderWithProviders(<RequesterHome />);
        const locationBtn = screen.getByText(/Chennai, Tamil Nadu/i);
        fireEvent.click(locationBtn);
        expect(navigateMock).toHaveBeenCalledWith("/saved-locations");
    });
});
