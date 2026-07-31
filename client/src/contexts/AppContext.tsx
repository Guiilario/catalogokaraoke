// BarberPro — App Context
// Theme: Dark Precision — manages auth state for both user and barber
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "user" | "barber" | null;

export interface CurrentUser {
  name: string;
  phone: string;
  role: "user";
}

export interface BarberSession {
  role: "barber";
  name: string;
}

type AppSession = CurrentUser | BarberSession | null;

interface AppContextType {
  session: AppSession;
  setSession: (s: AppSession) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>({
  session: null,
  setSession: () => {},
  logout: () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AppSession>(() => {
    try {
      const saved = localStorage.getItem("barberpro_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setSession = (s: AppSession) => {
    setSessionState(s);
    if (s) {
      localStorage.setItem("barberpro_session", JSON.stringify(s));
    } else {
      localStorage.removeItem("barberpro_session");
    }
  };

  const logout = () => setSession(null);

  return (
    <AppContext.Provider value={{ session, setSession, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

