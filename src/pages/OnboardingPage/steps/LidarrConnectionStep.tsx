import type { TestResult } from "@/hooks/useOnboarding";

interface LidarrConnectionStepProps {
  url: string;
  apiKey: string;
  testing: boolean;
  testResult: TestResult | null;
  onUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onTest: () => void;
}

export default function LidarrConnectionStep({
  url,
  apiKey,
  testing,
  testResult,
  onUrlChange,
  onApiKeyChange,
  onTest,
}: LidarrConnectionStepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400 mb-4">
        Connect to your Lidarr instance. You can find your API key in Lidarr
        under Settings &gt; General.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Lidarr URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="http://localhost:8686"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          API Key
        </label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Enter API key"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <button
        type="button"
        onClick={onTest}
        disabled={testing || !url || !apiKey}
        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-md text-sm transition-colors"
      >
        {testing ? "Testing..." : "Test Connection"}
      </button>
      {testResult && (
        <div
          className={`p-3 rounded-md text-sm ${
            testResult.success
              ? "bg-green-900/30 text-green-400 border border-green-800"
              : "bg-red-900/30 text-red-400 border border-red-800"
          }`}
        >
          {testResult.success
            ? `Connected! Lidarr v${testResult.version}`
            : `Connection failed: ${testResult.error}`}
        </div>
      )}
    </div>
  );
}
