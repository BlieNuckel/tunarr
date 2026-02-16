// components/PurchaseLinksModal.tsx
import Modal from "./Modal";

interface PurchaseLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistName: string;
  albumTitle: string;
  onAddToLibrary: () => void;
}

export default function PurchaseLinksModal({
  isOpen,
  onClose,
  artistName,
  albumTitle,
  onAddToLibrary,
}: PurchaseLinksModalProps) {
  const query = encodeURIComponent(`${artistName} ${albumTitle}`);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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

        <div className="pt-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleAddToLibrary}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Add to Library
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal >
  );
}
