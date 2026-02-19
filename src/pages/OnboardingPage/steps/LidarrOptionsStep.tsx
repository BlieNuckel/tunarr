import StepDescription from "../components/StepDescription";

interface LidarrOptionsStepProps {
  qualityProfiles: { id: number; name: string }[];
  qualityProfileId: number;
  metadataProfiles: { id: number; name: string }[];
  metadataProfileId: number;
  rootFolderPaths: { id: number; path: string }[];
  rootFolderPath: string;
  onQualityProfileChange: (id: number) => void;
  onMetadataProfileChange: (id: number) => void;
  onRootFolderChange: (path: string) => void;
}

export default function LidarrOptionsStep({
  qualityProfiles,
  qualityProfileId,
  metadataProfiles,
  metadataProfileId,
  rootFolderPaths,
  rootFolderPath,
  onQualityProfileChange,
  onMetadataProfileChange,
  onRootFolderChange,
}: LidarrOptionsStepProps) {
  return (
    <div className="space-y-4">
      <StepDescription text="Choose your default Lidarr settings for new artist additions." />
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Root Folder
        </label>
        <select
          value={rootFolderPath}
          onChange={(e) => onRootFolderChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-gray-900 focus:outline-none focus:border-amber-400 shadow-cartoon-md"
        >
          {rootFolderPaths.map((folder) => (
            <option key={folder.id} value={folder.path}>
              {folder.path}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Quality Profile
        </label>
        <select
          value={qualityProfileId}
          onChange={(e) => onQualityProfileChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-gray-900 focus:outline-none focus:border-amber-400 shadow-cartoon-md"
        >
          {qualityProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Metadata Profile
        </label>
        <select
          value={metadataProfileId}
          onChange={(e) => onMetadataProfileChange(Number(e.target.value))}
          className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-gray-900 focus:outline-none focus:border-amber-400 shadow-cartoon-md"
        >
          {metadataProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
