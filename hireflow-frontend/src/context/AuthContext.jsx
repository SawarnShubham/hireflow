/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api";

const AuthContext = createContext();
const STORAGE_KEY = "hireflow.auth";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  useEffect(() => {
    setAuthToken(session.token);
    if (session.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const login = async (credentials) => {
    const { data } = await api.post("/api/auth/login", credentials);
    const nextSession = {
      token: data.accessToken,
      user: data.user,
    };
    setSession(nextSession);
    return nextSession.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  };

  const logout = () => {
    setSession({ user: null, token: null });
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/api/auth/me", payload);
    setSession((current) => ({
      ...current,
      user: data.user,
    }));
    return data.user;
  };

  const changePassword = async (payload) => {
    const { data } = await api.patch("/api/auth/me/password", payload);
    return data;
  };

  const value = useMemo(
    () => ({
      user: session.user,
      token: session.token,
      isAuthenticated: Boolean(session.token),
      login,
      register,
      updateProfile,
      changePassword,
      logout,
    }),
    [session]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
