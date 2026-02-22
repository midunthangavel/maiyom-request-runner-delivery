import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mission, Offer, Runner, UserProfile, Review, Transaction } from "@/types";

// --- MISSIONS ---

export const useMissions = () => {
    return useQuery({
        queryKey: ["missions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("missions")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Mission[];
        },
    });
};

export const useMission = (id: string) => {
    return useQuery({
        queryKey: ["mission", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("missions")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Mission;
        },
        enabled: !!id,
    });
};

export const useCreateMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (mission: Partial<Mission>) => {
            const { data, error } = await supabase
                .from("missions")
                .insert(mission)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["missions"] });
        },
        // ... (existing useCreateMission)
    });
};

export const useUpdateMission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Mission> }) => {
            const { data, error } = await supabase
                .from("missions")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["mission", data.id] });
            queryClient.invalidateQueries({ queryKey: ["missions"] });
        },
    });
};

export const useMyMissions = (requesterId: string) => {
    return useQuery({
        queryKey: ["missions", "requester", requesterId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("missions")
                .select("*")
                .eq("requester_id", requesterId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Mission[];
        },
        enabled: !!requesterId,
    });
};

// --- OFFERS ---

export const useOffers = (missionId: string) => {
    return useQuery({
        queryKey: ["offers", missionId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("offers")
                .select(`
          *,
          runner:runner_id (*)
        `)
                .eq("mission_id", missionId);

            if (error) throw error;
            // Transform to match friendly structure if needed, or just return data
            // Supabase returns the join as an object or array.
            // Here runner will be an object { id, name, ... } inside the offer object.
            return data as (Offer & { runner: UserProfile })[];
        },
        enabled: !!missionId,
        // ... (closing brace of useOffers)
    });
};

export const useMyOffers = (runnerId: string) => {
    return useQuery({
        queryKey: ["offers", "runner", runnerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("offers")
                .select(`
                    *,
                    mission:mission_id (*)
                `)
                .eq("runner_id", runnerId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as (Offer & { mission: Mission })[];
        },
        enabled: !!runnerId,
    });
};

export const useCreateOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (offer: Partial<Offer>) => {
            const { data, error } = await supabase
                .from("offers")
                .insert(offer)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            // @ts-ignore
            queryClient.invalidateQueries({ queryKey: ["offers", variables.mission_id] });
        },
    });
};

// --- PROFILES ---

export const useProfile = (userId: string) => {
    return useQuery({
        queryKey: ["profile", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;
            return data as UserProfile;
        },
        enabled: !!userId,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserProfile> }) => {
            const { data, error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["profile", data.id] });
        },
    });
};

// --- REVIEWS ---

export const useReviews = (runnerId: string) => {
    return useQuery({
        queryKey: ["reviews", runnerId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("reviews")
                .select(`
                    *,
                    requester:requester_id (id, name, avatar_url)
                `)
                .eq("runner_id", runnerId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as (Review & { requester: { id: string; name: string; avatar_url?: string } })[];
        },
        enabled: !!runnerId,
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (review: Omit<Review, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("reviews")
                .insert(review)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["reviews", variables.runner_id] });
        },
    });
};

// --- TRANSACTIONS ---

export const useTransactions = (userId: string) => {
    return useQuery({
        queryKey: ["transactions", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Transaction[];
        },
        enabled: !!userId,
    });
};

// --- EARNINGS (computed from transactions) ---

export const useEarnings = (userId: string) => {
    return useQuery({
        queryKey: ["earnings", userId],
        queryFn: async () => {
            const now = new Date();
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            startOfWeek.setHours(0, 0, 0, 0);
            const startOfWeekISO = startOfWeek.toISOString();

            // Fetch all credits for this user this week
            const { data, error } = await supabase
                .from("transactions")
                .select("amount, created_at")
                .eq("user_id", userId)
                .eq("type", "credit")
                .gte("created_at", startOfWeekISO);

            if (error) throw error;

            let today = 0;
            let weekly = 0;

            for (const tx of data || []) {
                const amount = Number(tx.amount);
                weekly += amount;
                if (tx.created_at >= startOfToday) {
                    today += amount;
                }
            }

            return { today, weekly };
        },
        enabled: !!userId,
    });
};

// --- OFFER MUTATIONS ---

export const useAcceptOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ offerId, missionId }: { offerId: string; missionId: string }) => {
            // 1. Accept this offer
            const { error: acceptError } = await supabase
                .from("offers")
                .update({ status: "accepted" })
                .eq("id", offerId);
            if (acceptError) throw acceptError;

            // 2. Reject all other pending offers for this mission
            const { error: rejectError } = await supabase
                .from("offers")
                .update({ status: "rejected" })
                .eq("mission_id", missionId)
                .neq("id", offerId)
                .eq("status", "pending");
            if (rejectError) throw rejectError;

            // Generate 4-digit OTPs
            const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

            // 3. Update mission status to accepted and set OTPs
            const { error: missionError } = await supabase
                .from("missions")
                .update({
                    status: "accepted",
                    pickup_otp: pickupOtp,
                    delivery_otp: deliveryOtp
                })
                .eq("id", missionId);
            if (missionError) throw missionError;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["offers", variables.missionId] });
            queryClient.invalidateQueries({ queryKey: ["mission", variables.missionId] });
            queryClient.invalidateQueries({ queryKey: ["missions"] });
        },
    });
};

export const useRejectOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ offerId, missionId }: { offerId: string; missionId: string }) => {
            const { error } = await supabase
                .from("offers")
                .update({ status: "rejected" })
                .eq("id", offerId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["offers", variables.missionId] });
        },
    });
};

export const useCounterOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ offerId, counterPrice, missionId }: { offerId: string; counterPrice: number; missionId: string }) => {
            const { error } = await supabase
                .from("offers")
                .update({ status: "countered", counter_price: counterPrice })
                .eq("id", offerId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["offers", variables.missionId] });
        },
    });
};

export const useAcceptCounterOffer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ offerId, missionId, acceptedPrice }: { offerId: string; missionId: string; acceptedPrice: number }) => {
            // 1. Accept this offer and set new agreed price
            const { error: acceptError } = await supabase
                .from("offers")
                .update({ status: "accepted", price: acceptedPrice })
                .eq("id", offerId);
            if (acceptError) throw acceptError;

            // 2. Reject all other pending/countered offers for this mission
            const { error: rejectError } = await supabase
                .from("offers")
                .update({ status: "rejected" })
                .eq("mission_id", missionId)
                .neq("id", offerId)
                .in("status", ["pending", "countered"]);
            if (rejectError) throw rejectError;

            // Generate 4-digit OTPs
            const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();
            const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

            // 3. Update mission status to accepted and set OTPs
            const { error: missionError } = await supabase
                .from("missions")
                .update({
                    status: "accepted",
                    pickup_otp: pickupOtp,
                    delivery_otp: deliveryOtp
                })
                .eq("id", missionId);
            if (missionError) throw missionError;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["offers", variables.missionId] });
            queryClient.invalidateQueries({ queryKey: ["mission", variables.missionId] });
            queryClient.invalidateQueries({ queryKey: ["missions"] });
        },
    });
};
