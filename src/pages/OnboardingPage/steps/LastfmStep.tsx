import StepDescription from "../components/StepDescription";

interface LastfmStepProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function LastfmStep({
  apiKey,
  onApiKeyChange,
}: LastfmStepProps) {
  return (
    <div className="space-y-4">
      <StepDescription text="Last.fm powers the Discover page with similar artist recommendations and popular albums. You can skip this and add it later in Settings." />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Last.fm API Key
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Enter Last.fm API key"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
        <p className="text-gray-500 text-xs mt-1">
          Get a free API key at last.fm/api/account/create
        </p>
      </div>
    </div>
  );
}
