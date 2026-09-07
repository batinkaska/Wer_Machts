import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const { firebaseUser, loading, needsProfile, needsActivation } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (needsProfile) {
    return <Navigate to="/register" replace />;
  }

  if (needsActivation) {
    return <Navigate to="/konto-aktivieren" replace />;
  }

  return <>{children}</>;
}
