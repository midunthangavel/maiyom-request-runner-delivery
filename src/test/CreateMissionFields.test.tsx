
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreateMission from "../pages/CreateMission";
import { AppProvider } from "@/contexts/AppContext";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

// Mock dependencies
vi.mock("@/lib/mockData", async () => {
    const actual = await vi.importActual("@/lib/mockData");
    return {
        ...actual,
        scenarioIcons: { traveling: "🚗", event: "🎉", urgent: "⚡" },
        scenarioLabels: { traveling: "Traveling", event: "Event", urgent: "Urgent" }
    };
});

vi.mock("@/hooks/use-toast", () => ({
    useToast: () => ({ toast: vi.fn() })
}));

// Helper to wrap components with necessary providers
const renderWithProviders = (ui: React.ReactNode) => {
    return render(
        <AppProvider>
            <TooltipProvider>
                <BrowserRouter>
                    {ui}
                </BrowserRouter>
            </TooltipProvider>
        </AppProvider>
    );
};

describe("CreateMission Conditional Fields", () => {
    it("shows From/To fields only when Traveling scenario is selected", () => {
        renderWithProviders(<CreateMission />);

        // Initially "Traveling" is selected by default (based on state initialization)
        // Check if From field is present
        expect(screen.getByText("From")).toBeInTheDocument();
        expect(screen.getByText("To")).toBeInTheDocument();

        // Switch to "Urgent" scenario
        const urgentButtons = screen.getAllByText(/Urgent/i);
        fireEvent.click(urgentButtons[0]);

        // Check if From field is GONE
        expect(screen.queryByText("From")).not.toBeInTheDocument();
        expect(screen.queryByText("To")).not.toBeInTheDocument();

        // Switch back to "Traveling"
        const travelingButtons = screen.getAllByText(/Traveling/i);
        fireEvent.click(travelingButtons[0]);

        // Check if From field is back
        expect(screen.getByText("From")).toBeInTheDocument();
    });
});
