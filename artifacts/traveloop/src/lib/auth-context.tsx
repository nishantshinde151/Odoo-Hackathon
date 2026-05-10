import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getToken, clearToken } from "@/lib/api";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const hasToken = !!getToken();
  const { data: user, isLoading, isError } = useGetMe({
    query: { enabled: hasToken, retry: false, queryKey: getGetMeQueryKey() },
  });

  const logout = () => {
    clearToken();
    setLocation("/login");
  };

  const isAuthenticated = !!user && !isError;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading: hasToken ? isLoading : false, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  if (!token) return null;
  return <>{children}</>;
}
