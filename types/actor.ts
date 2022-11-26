export interface IActor {
  _id: string;
  name: string;
  description?: string;
  aliases: string[];
  thumbnail?: {
    _id: string;
    color?: string;
  };
  altThumbnail?: {
    _id: string;
  };
  avatar?: {
    _id: string;
    color?: string;
  };
  hero?: {
    _id: string;
    color?: string;
  };
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  rating: number;
  favorite: boolean;
  bookmark: boolean;
  age?: number;
  bornOn?: number;
  nationality?: {
    name: string;
    alpha2: string;
    nationality: string;
    alias?: string;
  };
  percentWatched: number;
  numScenes: number;
  watches: number[];
  averageRating: number;
  externalLinks: { url: string; text: string }[];
  score: number;
  resolvedCustomFields: {
    field: { _id: string; name: string; type: string; unit?: string };
    value: any;
  }[];
}
