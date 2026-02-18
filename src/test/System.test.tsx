import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

// Mock matchMedia and ResizeObserver as in App.test.tsx
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

global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe("System Test: Onboarding Flow", () => {
    beforeEach(() => {
        // Reset URL to root before each test
        window.history.pushState({}, "Root", "/");
    });

    it("navigates from Welcome to Onboarding and then to Auth", async () => {
        const user = userEvent.setup();
        render(<App />);

        // 1. Check we are on Welcome page
        await waitFor(() => {
            expect(screen.getByText(/Where Your/i)).toBeInTheDocument();
        });

        // 2. Click "Try App Now" to go to Onboarding
        // There are multiple buttons with this text (Navbar and Hero), click the first one?
        // userEvent.click might click the first one found if passed an element.
        const tryButtons = screen.getAllByText(/Try App Now/i);
        await user.click(tryButtons[0]);

        // 3. Verify Onboarding Slide 1: "Welcome to Maiyom"
        await waitFor(() => {
            expect(screen.getByText("Welcome to Maiyom")).toBeInTheDocument();
        });

        // 4. Click "Next" -> Slide 2: "Post a Mission"
        const nextButton = screen.getByRole("button", { name: "Next" });
        await user.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText("Post a Mission")).toBeInTheDocument();
        });

        // 5. Click "Next" -> Slide 3: "Track in Real-Time"
        await user.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText("Track in Real-Time")).toBeInTheDocument();
        });

        // 6. Click "Next" -> Slide 4: "Safe & Verified"
        await user.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText("Safe & Verified")).toBeInTheDocument();
        });

        // 7. Click "Get Started" -> Navigate to Auth
        // The button text changes to "Get Started" on the last slide
        const getStartedButton = screen.getByRole("button", { name: "Get Started" });
        await user.click(getStartedButton);

        // 8. Verify redirection to Auth page
        // Auth page likely has "Welcome Back" or "Login" text.
        // Checking Auth.tsx would confirm, but usually it has "Login" or "Register".
        // Let's assume URL check or looking for typical Auth elements.
        // Since we are in jsdom, we can check window.location.pathname
        await waitFor(() => {
            expect(window.location.pathname).toBe("/auth");
        });
    });
});
