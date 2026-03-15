import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/useAuth";
import { hasPermission } from "@shared/permissions";
import { Permission } from "@shared/permissions";
import { useRequests } from "@/hooks/useRequests";
import MineAllToggle from "./components/MineAllToggle";
import RequestList from "./components/RequestList";

export default function LibraryPage() {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const canViewAll =
    user !== null &&
    hasPermission(user.permissions, [
      Permission.REQUEST_VIEW,
      Permission.MANAGE_REQUESTS,
    ]);
  const canManageRequests =
    user !== null &&
    hasPermission(user.permissions, Permission.MANAGE_REQUESTS);
  const isAdmin =
    user !== null && hasPermission(user.permissions, Permission.ADMIN);

  const effectiveShowAll = canViewAll && showAll;
  const requestsOptions = useMemo(
    () => (effectiveShowAll ? {} : { userId: user?.id }),
    [effectiveShowAll, user?.id]
  );
  const { requests, loading, error, approveRequest, declineRequest, refresh } =
    useRequests(requestsOptions);

  const handleSearch = useCallback(async (albumId: number) => {
    try {
      await fetch("/api/lidarr/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumIds: [albumId] }),
      });
    } catch {
      // Silently fail — user can retry
    }
  }, []);

  const handleUnmonitor = useCallback(
    async (albumMbid: string) => {
      try {
        const res = await fetch("/api/lidarr/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumMbid }),
        });
        if (res.ok) refresh();
      } catch {
        // Silently fail — user can retry
      }
    },
    [refresh]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Library
      </h1>

      {canViewAll && <MineAllToggle showAll={showAll} onToggle={setShowAll} />}

      <RequestList
        requests={requests}
        loading={loading}
        error={error}
        emptyMessage={
          effectiveShowAll
            ? "No requests yet"
            : "You haven't made any requests yet"
        }
        showUser={effectiveShowAll}
        showActions={canManageRequests && effectiveShowAll}
        showAdminDetails={isAdmin}
        onApprove={approveRequest}
        onDecline={declineRequest}
        onSearch={handleSearch}
        onUnmonitor={handleUnmonitor}
      />
    </div>
  );
}
