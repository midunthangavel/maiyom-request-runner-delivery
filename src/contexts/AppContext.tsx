import React, { createContext, useContext, useState, ReactNode } from "react";
import { mockMissions, mockRunners, mockOffers, Mission, Runner, Offer } from "@/lib/mockData";

type UserRole = "requester" | "runner" | "both";
type AuthMethod = "phone" | "google" | "apple" | null;

interface UserProfile {
  name: string;
  dob: string;
  city: string;
  location: string;
  aadhaar: string;
  pan: string;
}

interface AppState {
  isAuthenticated: boolean;
  authMethod: AuthMethod;
  currentRole: UserRole;
  userId: string;
  userName: string;
  userProfile: UserProfile;
  missions: Mission[];
  runners: Runner[];
  offers: Offer[];
  walletBalance: number;
  setAuthenticated: (v: boolean) => void;
  setAuthMethod: (m: AuthMethod) => void;
  setCurrentRole: (r: UserRole) => void;
  setUserName: (n: string) => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setMissions: React.Dispatch<React.SetStateAction<Mission[]>>;
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
}

const defaultProfile: UserProfile = {
  name: "",
  dob: "",
  city: "",
  location: "",
  aadhaar: "",
  pan: "",
};

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>("requester");
  const [userName, setUserName] = useState("Rahul Kumar");
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [missions, setMissions] = useState<Mission[]>(mockMissions);
  const [offers, setOffers] = useState<Offer[]>(mockOffers);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authMethod,
        currentRole,
        userId: "u1",
        userName,
        userProfile,
        missions,
        runners: mockRunners,
        offers,
        walletBalance: 2450,
        setAuthenticated,
        setAuthMethod,
        setCurrentRole,
        setUserName,
        setUserProfile,
        setMissions,
        setOffers,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
