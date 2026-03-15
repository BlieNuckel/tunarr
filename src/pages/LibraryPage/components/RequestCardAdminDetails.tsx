import { LidarrLifecycle } from "@/types";
import { SearchIcon, EyeSlashIcon } from "@/components/icons";

interface RequestCardAdminDetailsProps {
  lidarr: LidarrLifecycle;
  albumMbid: string;
  onSearch?: (albumId: number) => void;
  onUnmonitor?: (albumMbid: string) => void;
}

interface LastEventInfo {
  text: string;
  colorClass: string;
}

function formatEventLabel(
  lastEvent: { eventType: number; date: string } | null
): LastEventInfo | null {
  if (!lastEvent) return null;

  const date = new Date(lastEvent.date).toLocaleDateString();

  switch (lastEvent.eventType) {
    case 1:
      return { text: `Grabbed ${date}`, colorClass: "text-amber-500" };
    case 4:
      return { text: `Download failed ${date}`, colorClass: "text-rose-500" };
    case 7:
      return {
        text: `Import incomplete ${date}`,
        colorClass: "text-orange-500",
      };
    default:
      return { text: `Event ${date}`, colorClass: "text-gray-400" };
  }
}

export default function RequestCardAdminDetails({
  lidarr,
  albumMbid,
  onSearch,
  onUnmonitor,
}: RequestCardAdminDetailsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
      {lidarr.status === "downloading" && lidarr.downloadProgress !== null && (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full border border-black/20">
            <div
              className="h-full bg-sky-400 rounded-full transition-all"
              style={{ width: `${lidarr.downloadProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {lidarr.downloadProgress}%
          </span>
        </div>
      )}

      {lidarr.quality && (
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {lidarr.quality}
        </span>
      )}

      {lidarr.sourceIndexer && (
        <span className="text-xs text-gray-400">
          via {lidarr.sourceIndexer}
        </span>
      )}

      {lidarr.lastEvent &&
        (() => {
          const eventInfo = formatEventLabel(lidarr.lastEvent);
          if (!eventInfo) return null;
          return (
            <span className={`text-xs ${eventInfo.colorClass}`}>
              {eventInfo.text}
            </span>
          );
        })()}

      {lidarr.status === "wanted" && lidarr.lidarrAlbumId !== null && (
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => onUnmonitor?.(albumMbid)}
            aria-label="Unmonitor"
            className="w-7 h-7 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-300 rounded-md border-2 border-black shadow-cartoon-sm hover:-translate-y-px hover:shadow-cartoon-md active:translate-y-px active:shadow-cartoon-pressed transition-all"
          >
            <EyeSlashIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSearch?.(lidarr.lidarrAlbumId!)}
            aria-label="Search"
            className="w-7 h-7 flex items-center justify-center bg-pink-400 hover:bg-pink-300 text-black rounded-md border-2 border-black shadow-cartoon-sm hover:-translate-y-px hover:shadow-cartoon-md active:translate-y-px active:shadow-cartoon-pressed transition-all"
          >
            <SearchIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
