import StatusBadge from "@/components/StatusBadge";
import { RequestItem } from "@/types";
import RequestCardActions from "./RequestCardActions";
import RequestCardAdminDetails from "./RequestCardAdminDetails";

interface RequestCardProps {
  request: RequestItem;
  index: number;
  showUser?: boolean;
  showActions?: boolean;
  showAdminDetails?: boolean;
  onApprove?: (id: number) => void;
  onDecline?: (id: number) => void;
  onSearch?: (albumId: number) => void;
  onUnmonitor?: (albumMbid: string) => void;
}

function resolveDisplayStatus(request: RequestItem): string {
  if (request.lidarr?.status) return request.lidarr.status;
  return request.status;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}

export default function RequestCard({
  request,
  index,
  showUser = false,
  showActions = false,
  showAdminDetails = false,
  onApprove,
  onDecline,
  onSearch,
  onUnmonitor,
}: RequestCardProps) {
  const displayStatus = resolveDisplayStatus(request);

  return (
    <div
      className="stagger-fade-in bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border-2 border-black shadow-cartoon-md hover:-translate-y-0.5 hover:shadow-cartoon-lg transition-all"
      style={{ "--stagger-index": index } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
            {request.albumTitle || request.albumMbid}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">
            {request.artistName || "Unknown Artist"}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 text-xs">
              {formatDate(request.createdAt)}
            </span>
            {showUser && request.user && (
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                {request.user.thumb && (
                  <img
                    src={request.user.thumb}
                    alt=""
                    className="w-4 h-4 rounded-full"
                  />
                )}
                {request.user.username}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3 shrink-0">
          {showActions && request.status === "pending" && (
            <RequestCardActions
              requestId={request.id}
              onApprove={onApprove}
              onDecline={onDecline}
            />
          )}
          <StatusBadge status={displayStatus} />
        </div>
      </div>

      {showAdminDetails && request.lidarr && request.lidarr.status && (
        <RequestCardAdminDetails
          lidarr={request.lidarr}
          albumMbid={request.albumMbid}
          onSearch={onSearch}
          onUnmonitor={onUnmonitor}
        />
      )}
    </div>
  );
}
