import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types";
import { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

type AuthMethod = "email" | "google" | "apple" | null;

interface AppState {
  isAuthenticated: boolean;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;

  // Actions
  logout: () => Promise<void>;

  // Legacy / Helper fields for compatibility during refactor
  currentRole: "requester" | "runner";
  setCurrentRole: (r: "requester" | "runner") => void;
  userId: string | undefined;
  userName: string;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<"requester" | "runner">("requester");
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setIsLoading(false);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsLoading(false);
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setUserProfile(data as UserProfile);
        // Default role based on profile if available, else keep default
        if (data.role && data.role !== "both") {
          setCurrentRole(data.role as "requester" | "runner");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated: !!session,
        session,
        userProfile,
        isLoading,
        logout,
        currentRole,
        setCurrentRole,
        userId: session?.user.id,
        userName: userProfile?.name || "User",
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
