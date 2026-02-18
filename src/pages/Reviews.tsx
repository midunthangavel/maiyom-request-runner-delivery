import PageShell from "@/components/PageShell";
import { ArrowLeft, Star, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getReviewsForRunner, type Review } from "@/lib/reviewStore";
import { useState, useEffect } from "react";

const Reviews = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        // Mock user ID "r1"
        setReviews(getReviewsForRunner("r1"));
    }, []);

    return (
        <PageShell hideNav>
            <div className="px-5 pt-6">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft size={20} className="text-foreground" />
                    </button>
                    <h1 className="font-display font-semibold text-foreground">Reviews</h1>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-card border border-border rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold font-display text-foreground">4.8</p>
                        <div className="flex justify-center text-warning text-xs mt-1">
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Average Rating</p>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4 text-center flex flex-col justify-center">
                        <p className="text-3xl font-bold font-display text-foreground">{reviews.length}</p>
                        <p className="text-xs text-muted-foreground mt-2">Total Reviews</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-card rounded-lg border border-border p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                        {rev.reviewerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{rev.reviewerName}</p>
                                        <p className="text-[10px] text-muted-foreground">{new Date(rev.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5 bg-secondary px-1.5 py-0.5 rounded text-xs font-medium">
                                    <Star size={10} className="text-warning fill-warning" />
                                    {rev.rating}
                                </div>
                            </div>

                            {rev.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {rev.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            )}
                            {rev.comment && (
                                <p className="text-sm text-foreground/80">"{rev.comment}"</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PageShell>
    );
};

export default Reviews;
