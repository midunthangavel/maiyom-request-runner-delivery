export const scenarioIcons = {
    traveling: "🚆",
    event: "🎉",
    urgent: "🚨",
};

export const scenarioLabels = {
    traveling: "Traveling",
    event: "Event",
    urgent: "Urgent",
};

export const statusColors = {
    open: "bg-blue-100 text-blue-700",
    offered: "bg-purple-100 text-purple-700",
    accepted: "bg-yellow-100 text-yellow-700",
    in_transit: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
};

export const statusLabels = {
    open: "Open",
    offered: "Offered",
    accepted: "Accepted",
    in_transit: "In Transit",
    delivered: "Delivered",
};

export const notificationIcons: Record<string, string> = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
};

// City coordinates for basic geocoding (Mock)
export const CITY_COORDS: Record<string, [number, number]> = {
    "Chennai": [13.0827, 80.2707],
    "Chennai Central": [13.0827, 80.2707],
    "Coimbatore": [11.0168, 76.9558],
    "Bengaluru": [12.9716, 77.5946],
    "Bangalore": [12.9716, 77.5946],
    "Bengaluru Airport": [13.1986, 77.7066],
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.7041, 77.1025],
    "Hyderabad": [17.3850, 78.4867],
    "Kochi": [9.9312, 76.2673],
    "Madurai": [9.9252, 78.1198],
    "Trichy": [10.7905, 78.7047],
    "Tiruchirappalli": [10.7905, 78.7047],
    "Salem": [11.6643, 78.1460],
};
