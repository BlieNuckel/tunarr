import { lidarrGet } from "../../api/lidarr/get.js";
import type {
  LidarrQualityProfile,
  LidarrMetadataProfile,
  LidarrRootFolder,
} from "../../api/lidarr/types";

export async function getQualityProfiles() {
  const result = await lidarrGet<LidarrQualityProfile[]>("/qualityprofile");
  return result.data;
}

export async function getMetadataProfiles() {
  const result = await lidarrGet<LidarrMetadataProfile[]>("/metadataprofile");
  return result.data;
}

export async function getRootFolders() {
  const result = await lidarrGet<LidarrRootFolder[]>("/rootfolder");
  return result.data;
}
