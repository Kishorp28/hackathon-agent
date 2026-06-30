"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { GenerateResponse, UserPreferences } from "@/lib/types";

interface HackathonContextValue {
  result: GenerateResponse | null;
  setResult: (result: GenerateResponse | null) => void;
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
}

const defaultPreferences: UserPreferences = {
  team_size: 4,
  hackathon_type: "AI",
  preferred_stack: "MERN",
};

const HackathonContext = createContext<HackathonContextValue | null>(null);

export function HackathonProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <HackathonContext.Provider
      value={{
        result,
        setResult,
        preferences,
        setPreferences,
        isGenerating,
        setIsGenerating,
        error,
        setError,
      }}
    >
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  const ctx = useContext(HackathonContext);
  if (!ctx) throw new Error("useHackathon must be used within HackathonProvider");
  return ctx;
}
