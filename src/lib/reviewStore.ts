export interface Review {
    id: string;
    runnerId: string;
    missionId: string;
    rating: number;
    tags: string[];
    comment: string;
    reviewerName: string;
    date: string;
}

const REVIEWS_KEY = "maiyom_reviews";

function getAll(): Review[] {
    try {
        return JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    } catch {
        return [];
    }
}

function save(reviews: Review[]) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function saveReview(review: Omit<Review, "id" | "date">): Review {
    const all = getAll();
    const newReview: Review = {
        ...review,
        id: `rev_${Date.now()}`,
        date: new Date().toISOString(),
    };
    all.unshift(newReview);
    save(all);
    return newReview;
}

export function getReviewsForRunner(runnerId: string): Review[] {
    return getAll().filter((r) => r.runnerId === runnerId);
}

export function getAverageRating(runnerId: string): number | null {
    const reviews = getReviewsForRunner(runnerId);
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
}

export function getTrustScore(rating: number, completedMissions: number): {
    label: string;
    color: string;
    level: number;
} {
    const score = rating * 0.6 + Math.min(completedMissions / 50, 1) * 4 * 0.4;
    if (score >= 4.5) return { label: "Trusted Pro", color: "text-emerald-500", level: 3 };
    if (score >= 3.5) return { label: "Reliable", color: "text-blue-500", level: 2 };
    return { label: "Rising", color: "text-warning", level: 1 };
}

export function getAllReviews(): Review[] {
    return getAll();
}
