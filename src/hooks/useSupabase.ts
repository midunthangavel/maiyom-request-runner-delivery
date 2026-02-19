import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Mission, Offer, Runner, UserProfile } from "@/types";

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
