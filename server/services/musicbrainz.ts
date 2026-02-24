import { getTrackPreviews } from "../api/deezer/tracks";

type Track = { title: string; [key: string]: unknown };
type Medium = { tracks: Track[]; [key: string]: unknown };

export async function enrichTracksWithPreviews(
  media: Medium[],
  artistName: string
): Promise<Medium[]> {
  const allTracks = media.flatMap((m) =>
    m.tracks.map((t) => ({ artistName, title: t.title }))
  );

  const previews = await getTrackPreviews(allTracks);

  return media.map((medium) => ({
    ...medium,
    tracks: medium.tracks.map((track) => {
      const key = `${artistName.toLowerCase()}|${track.title.toLowerCase()}`;
      const previewUrl = previews.get(key) || "";
      return previewUrl ? { ...track, previewUrl } : track;
    }),
  }));
}
