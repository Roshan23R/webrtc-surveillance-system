import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { getUsernameFromToken } from "./utils/jwt";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";


export default function App() {
  const {
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
  } = useAuth();

  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (token) {
      setUsername(getUsernameFromToken(token));
    } else {
      setUsername("");
    }
  }, [token]);

  if (!token) {
    return (
      <AuthPage
        isLogin={isLogin}
        authUsername={authUsername}
        authPassword={authPassword}
        authError={authError}
        authSuccess={authSuccess}
        authLoading={authLoading}
        onUsernameChange={setAuthUsername}
        onPasswordChange={setAuthPassword}
        onSubmit={handleAuth}
        onToggleMode={toggleAuthMode}
      />
    );
  }

  return (
    <DashboardPage
      token={token}
      username={username}
      onLogout={handleLogout}
    />
  );
}