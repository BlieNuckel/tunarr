import StepDescription from "../components/StepDescription";

interface PlexStepProps {
  url: string;
  token: string;
  onUrlChange: (url: string) => void;
  onTokenChange: (token: string) => void;
}

export default function PlexStep({
  url,
  token,
  onUrlChange,
  onTokenChange,
}: PlexStepProps) {
  return (
    <div className="space-y-4">
      <StepDescription text="Connect Plex to show your most-played artists on the Discover page. You can skip this and add it later in Settings." />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Plex URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="http://localhost:32400"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Plex Token
        </label>
        <input
          type="text"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="Enter Plex token"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>
  );
}
