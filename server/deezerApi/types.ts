export type DeezerArtist = {
  picture_big: string;
  picture_medium: string;
};

export type DeezerSearchResponse = {
  data: DeezerArtist[];
};
