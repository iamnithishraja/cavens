import { useEffect, useMemo, useState } from "react";
import Login from "./Pages/Login";
import ApproveClubs from "./Pages/ApproveClubs";

function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    setToken(localStorage.getItem("admin_token"));
    const onStorage = () => setToken(localStorage.getItem("admin_token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return useMemo(() => ({ token, isAuthenticated: !!token }), [token]);
}

function App() {
  const { isAuthenticated } = useAuth();

  // Simple path-based routing without adding libs
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (!isAuthenticated) {
    return <Login />;
  }
  if (path.startsWith("/approve")) {
    return <ApproveClubs />;
  }
  // Default route
  return <ApproveClubs />;
}

export default App
