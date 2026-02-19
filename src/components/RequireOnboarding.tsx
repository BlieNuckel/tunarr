import { Navigate, Outlet } from "react-router-dom";
import { useLidarrContext } from "@/context/useLidarrContext";

export default function RequireOnboarding() {
  const { settings, isLoading } = useLidarrContext();

  if (isLoading) return null;

  if (!settings.lidarrUrl) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}
