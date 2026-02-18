
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Profile from "../pages/Profile";
import RequesterHome from "../pages/RequesterHome";
import RunnerFeed from "../pages/RunnerFeed";
import { AppProvider } from "@/contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock dependencies
vi.mock("@/lib/mockData", () => ({
    mockRunners: [{ rating: 4.8, completedMissions: 10, earnings: { today: 100, weekly: 500 }, streak: 5, verificationLevel: 2 }],
    mockMissions: []
}));

vi.mock("@/lib/reviewStore", () => ({
    getReviewsForRunner: () => [],
    getAverageRating: () => 4.8,
    getTrustScore: () => ({ label: "Trusted", color: "text-green-500" })
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

// Helper to wrap components with necessary providers
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <ThemeProvider>
            <AppProvider>
                <TooltipProvider>
                    <BrowserRouter>
                        {ui}
                    </BrowserRouter>
                </TooltipProvider>
            </AppProvider>
        </ThemeProvider>
    );
};

describe("RoleSwitcher Location", () => {
    it("should be present on Profile page", () => {
        renderWithProviders(<Profile />);
        // RoleSwitcher has generic text "Requester" and "Runner"
        expect(screen.getByText("Requester")).toBeInTheDocument();
        expect(screen.getByText("Runner")).toBeInTheDocument();
    });

    it("should NOT be present on RequesterHome page", () => {
        renderWithProviders(<RequesterHome />);
        // "Requester" might be present in other contexts (e.g. "Requester" badge), but RoleSwitcher has specific buttons.
        // However, in our changes, we removed RoleSwitcher. 
        // Let's check that the *specific* RoleSwitcher structure isn't there, or simpler, checking for "Runner" text which shouldn't be on RequesterHome if the switcher is gone.
        // Wait, is "Runner" used anywhere else on RequesterHome?
        // RequesterHome shows "Good evening, [Name]", "Active Missions", "Nearby Missions".
        // It shouldn't have "Runner" text unless it's in the switcher.
        // But let's be careful.

        // Actually, RoleSwitcher renders a button with text "Runner".
        const runnerButton = screen.queryByRole('button', { name: /runner/i });
        expect(runnerButton).not.toBeInTheDocument();
    });

    it("should NOT be present on RunnerFeed page", () => {
        renderWithProviders(<RunnerFeed />);
        // RunnerFeed definitely shouldn't have "Requester" button if switcher is gone.
        const requesterButton = screen.queryByRole('button', { name: /requester/i });
        expect(requesterButton).not.toBeInTheDocument();
    });
});
