import { lidarrPost } from "../../api/lidarr/post";

export async function triggerAlbumSearch(albumIds: number[]) {
  return lidarrPost("/command", {
    name: "AlbumSearch",
    albumIds,
  });
}
