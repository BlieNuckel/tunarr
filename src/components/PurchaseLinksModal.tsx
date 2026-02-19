import { useRef } from "react";
import Modal from "./Modal";
import useManualImport, { ManualImportItem } from "../hooks/useManualImport";

interface PurchaseLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistName: string;
  albumTitle: string;
  albumMbid: string;
  onAddToLibrary: () => void;
}

const ACCEPTED_TYPES = ".flac,.mp3,.ogg,.wav,.m4a,.aac";

export default function PurchaseLinksModal({
  isOpen,
  onClose,
  artistName,
  albumTitle,
  albumMbid,
  onAddToLibrary,
}: PurchaseLinksModalProps) {
  const query = encodeURIComponent(`${artistName} ${albumTitle}`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { step, items, error, upload, confirm, cancel, reset } = useManualImport();

  const links = [
    {
      platform: "Bandcamp",
      url: `https://bandcamp.com/search?q=${query}`,
      icon: "bandcamp.png",
    },
    {
      platform: "Qobuz",
      url: `https://www.qobuz.com/us-en/search?q=${query}`,
      icon: "qobuz.png",
    },
  ];

  const handleAddToLibrary = () => {
    onAddToLibrary();
    onClose();
  };

  const handleClose = () => {
    if (step === "reviewing") {
      cancel();
    } else {
      reset();
    }
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      upload(e.target.files, albumMbid);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      upload(e.dataTransfer.files, albumMbid);
    }
  };

  const handleConfirm = () => {
    confirm(items);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Purchase Options</h2>
          <p className="text-gray-400 text-sm">
            {albumTitle} by {artistName}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-gray-300 text-sm font-medium">
            Check availability and pricing:
          </p>
          {links.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 hover:border-gray-500"
            >
              <img src={link.icon} className="h-12" />
              <div className="flex-1">
                <p className="text-white font-medium">{link.platform}</p>
                <p className="text-gray-400 text-xs">
                  View pricing and purchase
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-300 text-sm font-medium mb-2">
            Upload purchased files:
          </p>

          {step === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
            >
              <svg className="w-8 h-8 mx-auto text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 text-sm">
                Drop audio files here or click to browse
              </p>
              <p className="text-gray-600 text-xs mt-1">
                FLAC, MP3, OGG, WAV, M4A, AAC
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {step === "uploading" && (
            <div className="flex items-center justify-center gap-2 py-6">
              <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-300 text-sm">Uploading and scanning files...</p>
            </div>
          )}

          {step === "reviewing" && (
            <div className="space-y-3">
              <div className="max-h-60 overflow-y-auto space-y-1">
                {items.map((item: ManualImportItem, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{item.name}</p>
                      <div className="flex gap-2 text-xs">
                        {item.tracks?.[0] && (
                          <span className="text-gray-400">
                            {item.tracks[0].trackNumber}. {item.tracks[0].title}
                          </span>
                        )}
                        <span className="text-gray-500">{item.quality?.quality?.name}</span>
                      </div>
                    </div>
                    {item.rejections?.length > 0 && (
                      <span className="text-yellow-400 text-xs flex-shrink-0" title={item.rejections.map(r => r.reason).join(", ")}>
                        {item.rejections.length} warning{item.rejections.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Confirm Import ({items.length} file{items.length !== 1 ? "s" : ""})
                </button>
                <button
                  onClick={cancel}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex items-center justify-center gap-2 py-6">
              <svg className="animate-spin h-5 w-5 text-green-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-gray-300 text-sm">Importing to Lidarr...</p>
            </div>
          )}

          {step === "done" && (
            <div className="bg-green-900/30 text-green-400 border border-green-800 rounded-lg p-3 text-sm">
              Files imported successfully!
            </div>
          )}

          {step === "error" && (
            <div className="space-y-2">
              <div className="bg-red-900/30 text-red-400 border border-red-800 rounded-lg p-3 text-sm">
                {error}
              </div>
              <button
                onClick={reset}
                className="text-gray-400 hover:text-gray-300 text-sm underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleAddToLibrary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Add to Library
          </button>
          <button
            onClick={handleClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal >
  );
}
