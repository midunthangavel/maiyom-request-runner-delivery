import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PageShell from "./PageShell";
import { BrowserRouter } from "react-router-dom";

import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Helper to render with router context since BottomNav likely uses router hooks/components
const renderWithRouter = (component: React.ReactNode) => {
    return render(
        <AppProvider>
            <LanguageProvider>
                <NotificationProvider>
                    <BrowserRouter>{component}</BrowserRouter>
                </NotificationProvider>
            </LanguageProvider>
        </AppProvider>
    );
};

describe("PageShell", () => {
    it("renders children correctly", () => {
        renderWithRouter(
            <PageShell>
                <div data-testid="child-content">Child Content</div>
            </PageShell>
        );

        expect(screen.getByTestId("child-content")).toBeInTheDocument();
        expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("renders BottomNav by default", () => {
        renderWithRouter(
            <PageShell>
                <div>Content</div>
            </PageShell>
        );
        // Assuming BottomNav has a role of navigation or some identifiable text/element
        const nav = screen.getByRole("navigation");
        expect(nav).toBeInTheDocument();
    });

    it("hides BottomNav when hideNav is true", () => {
        renderWithRouter(
            <PageShell hideNav>
                <div>Content</div>
            </PageShell>
        );
        const nav = screen.queryByRole("navigation");
        expect(nav).not.toBeInTheDocument();
    });

    it("applies custom className", () => {
        const { container } = renderWithRouter(
            <PageShell className="custom-class">
                <div>Content</div>
            </PageShell>
        );
        // PageShell renders a div with classes. We check if the outer div has the custom class.
        // The structure is <div class="... custom-class"><div class="pb-20">...</div>...</div>
        // We can check the first child of the container (which is the rendered component)
        expect(container.firstChild).toHaveClass("custom-class");
    });
});
