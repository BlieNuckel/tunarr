import StepDescription from "../components/StepDescription";

interface ImportStepProps {
  importPath: string;
  onImportPathChange: (path: string) => void;
}

export default function ImportStep({
  importPath,
  onImportPathChange,
}: ImportStepProps) {
  return (
    <div className="space-y-4">
      <StepDescription text="Set a shared import directory accessible by both Music Requester and Lidarr for file uploads. You can skip this and add it later in Settings." />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Import Path
        </label>
        <input
          type="text"
          value={importPath}
          onChange={(e) => onImportPathChange(e.target.value)}
          placeholder="/imports"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
        <p className="text-xs text-gray-400 mb-2 font-medium">
          Docker Compose example:
        </p>
        <pre className="text-xs text-gray-500 overflow-x-auto">{`services:
  lidarr:
    volumes:
      - /path/to/imports:/imports

  music-requester:
    volumes:
      - /path/to/imports:/imports`}</pre>
      </div>
    </div>
  );
}
