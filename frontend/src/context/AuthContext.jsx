import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chatbot_user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("chatbot_token"))
  );

  useEffect(() => {
    const token = localStorage.getItem("chatbot_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then(({ data }) => {
        const next = data.data.user;

        setUser(next);
        localStorage.setItem("chatbot_user", JSON.stringify(next));
      })
      .catch(() => {
        setUser(null);

        localStorage.removeItem("chatbot_token");
        localStorage.removeItem("chatbot_user");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ==============================
  // LOGIN
  // ==============================
  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);

    const next = data.data.user;

    localStorage.setItem("chatbot_token", data.data.token);
    localStorage.setItem("chatbot_user", JSON.stringify(next));

    setUser(next);

    return next;
  };

  // ==============================
  // REGISTER
  // ==============================
  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);

    const next = data.data.user;

    localStorage.setItem("chatbot_token", data.data.token);
    localStorage.setItem("chatbot_user", JSON.stringify(next));

    setUser(next);

    return next;
  };

  // ==============================
  // UPDATE USER
  // ==============================
  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem(
      "chatbot_user",
      JSON.stringify(updatedUser)
    );
  };

  // ==============================
  // LOGOUT
  // ==============================
  const logout = () => {
    localStorage.removeItem("chatbot_token");
    localStorage.removeItem("chatbot_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}