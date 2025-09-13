import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = { id: string; name: string; email: string; avatar?: string };
type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("auth:user").then(x => {
      if (x) setUser(JSON.parse(x));
      setLoading(false);
    });
  }, []);

  const persist = async (u: User | null) => {
    if (u) await AsyncStorage.setItem("auth:user", JSON.stringify(u));
    else await AsyncStorage.removeItem("auth:user");
    setUser(u);
  };

  const signIn = async (email: string, password: string) => {
    const u: User = { id: "local-" + Date.now(), name: email.split("@")[0], email };
    await persist(u);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const u: User = { id: "local-" + Date.now(), name, email };
    await persist(u);
  };

  const signOut = async () => {
    await persist(null);
  };

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
