import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./Loading";

// Keeps pages closed for people who are not logged in.
// With adminOnly, staff members are sent back to the POS.
// The backend checks this again, because this check only hides the screen.

type Props = {
  children: ReactNode;
  adminOnly?: boolean;
};

export function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth();

  // Still checking the saved token, so we do not know yet.
  if (loading) {
    return <Loading text="Checking your login..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/pos" replace />;
  }

  return <>{children}</>;
}
