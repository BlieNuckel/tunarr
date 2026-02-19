import { useState } from "react";
import MonitorButton from "./MonitorButton";
import PurchaseLinksModal from "./PurchaseLinksModal";
import useLidarr from "../hooks/useLidarr";
import { ReleaseGroup } from "../types";

interface ReleaseGroupCardProps {
  releaseGroup: ReleaseGroup;
}

export default function ReleaseGroupCard({ releaseGroup }: ReleaseGroupCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const artistName =
    releaseGroup["artist-credit"]?.[0]?.artist?.name || "Unknown Artist";
  const albumTitle = releaseGroup.title || "";
  const albumMbid = releaseGroup.id;
  const year = releaseGroup["first-release-date"]?.slice(0, 4) || "";
  const coverUrl = `https://coverartarchive.org/release-group/${albumMbid}/front-250`;

  const { state, errorMsg, addToLidarr } = useLidarr();

  const handleClick = () => {
    if (!albumTitle) {
      addToLidarr({ albumMbid });
      return;
    }

    if (state === "idle" || state === "error") {
      setIsModalOpen(true);
    }
  };

  const handleAddToLibrary = () => {
    addToLidarr({ albumMbid });
  };

  return (
    <>
      <div className="flex gap-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <img
          src={coverUrl}
          alt={`${albumTitle} cover`}
          className="w-24 h-24 rounded object-cover bg-gray-700 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{albumTitle}</h3>
          <p className="text-gray-400 text-sm">{artistName}</p>
          {year && <p className="text-gray-500 text-xs mt-1">{year}</p>}
          <p className="text-gray-600 text-xs mt-1 truncate">{albumMbid}</p>
        </div>
        <div className="flex items-start">
          <MonitorButton
            state={state}
            onClick={handleClick}
            errorMsg={errorMsg ?? undefined}
          />
        </div>
      </div>

      <PurchaseLinksModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        artistName={artistName}
        albumTitle={albumTitle}
        albumMbid={albumMbid}
        onAddToLibrary={handleAddToLibrary}
      />
    </>
  );
}
