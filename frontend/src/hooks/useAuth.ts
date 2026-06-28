import { useState } from "react";
import { login, signup, logout } from "../services/api";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLogin, setIsLogin] = useState(true);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    if (!authUsername || !authPassword) {
      setAuthError("All fields are required.");
      setAuthLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const userToken = await login(authUsername, authPassword);
        setToken(userToken);
      } else {
        await signup(authUsername, authPassword);
        setAuthSuccess("Account created successfully! You can now log in.");
        setIsLogin(true);
        setAuthPassword("");
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setToken(null);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setAuthError("");
    setAuthSuccess("");
  };

  return {
    token,
    isLogin,
    authUsername,
    authPassword,
    authError,
    authSuccess,
    authLoading,
    setAuthUsername,
    setAuthPassword,
    handleAuth,
    handleLogout,
    toggleAuthMode,
  };
}
