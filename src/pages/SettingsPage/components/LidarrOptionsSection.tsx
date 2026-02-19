interface LidarrOptionsSectionProps {
  rootFolders: { id: number; path: string }[];
  rootFolderPath: string;
  qualityProfiles: { id: number; name: string }[];
  qualityProfileId: number;
  metadataProfiles: { id: number; name: string }[];
  metadataProfileId: number;
  onRootFolderChange: (path: string) => void;
  onQualityProfileChange: (id: number) => void;
  onMetadataProfileChange: (id: number) => void;
}

export default function LidarrOptionsSection({
  rootFolders,
  rootFolderPath,
  qualityProfiles,
  qualityProfileId,
  metadataProfiles,
  metadataProfileId,
  onRootFolderChange,
  onQualityProfileChange,
  onMetadataProfileChange,
}: LidarrOptionsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Lidarr Root Path
        </label>
        <select
          key={rootFolders.length}
          value={rootFolderPath}
          onChange={(e) => onRootFolderChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border-2 border-black rounded-lg text-gray-900 focus:outline-none focus:border-amber-400 shadow-cartoon-md"
        >
          {rootFolders.map((folder) => (
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
          key={qualityProfiles.length}
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
          key={metadataProfiles.length}
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
