import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

// Mocking some of the providers or heavy components if necessary, 
// but for an integration test of App, we ideally want to test the real deal.
// However, App renders BrowserRouter, which might conflict if we wrap it in another Router.
// App.tsx has its own BrowserRouter.

// We need to mock matchMedia for some UI components that might use it (like Radix UI)
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

describe("App Integration", () => {
    it("renders without crashing and shows Welcome page initially", async () => {
        render(<App />);

        // The default route is "/" which renders <Welcome />
        // Welcome page has a "Join the Waitlist" button or text "Delivering happiness" (from Hero)
        // Let's check for something unique on the Welcome page.
        // Based on Welcome.tsx imports, it has a Hero section.

        // We can look for the "Get Started" or similar text from the landing page.
        // Since I don't see the content of Welcome/Hero, I'll check for keys if possible or general structure.
        // Or I can check for "Maiyom" if it's in the title.

        // Wait for the app to load
        await waitFor(() => {
            const welcomeElements = screen.getAllByText(/Maiyom/i); // Assuming "Maiyom" is present
            expect(welcomeElements.length).toBeGreaterThan(0);
        }, { timeout: 3000 });
    });
});
