/**
 * Browser Push Notification helpers using the Notification API.
 * No service worker needed for basic notifications.
 */

/** Request permission from the user to show notifications */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
        console.warn("This browser does not support notifications.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
}

/** Show a native browser notification */
export async function showBrowserNotification(
    title: string,
    body: string,
    options?: {
        icon?: string;
        actionUrl?: string;
        tag?: string;
    }
) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    // Try showing notification via Service Worker if available (better for mobile/PWA)
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
                body,
                icon: options?.icon || "/maiyom-icon.png",
                badge: "/maiyom-icon.png",
                tag: options?.tag || "maiyom-notification",
                data: { actionUrl: options?.actionUrl }
            });
            return;
        } catch (swError) {
            console.warn("Failed to show notification via service worker, falling back to native:", swError);
        }
    }

    // Fallback to native Notification API
    const notification = new Notification(title, {
        body,
        icon: options?.icon || "/maiyom-icon.png",
        badge: "/maiyom-icon.png",
        tag: options?.tag || "maiyom-notification",
        requireInteraction: false,
    });

    if (options?.actionUrl) {
        notification.onclick = () => {
            window.focus();
            window.location.href = options.actionUrl!;
            notification.close();
        };
    }

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
}
