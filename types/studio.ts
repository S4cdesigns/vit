export interface IStudio {
  _id: string;
  name: string;
  favorite: boolean;
  bookmark: boolean;
  thumbnail?: {
    _id: string;
  };
  parent?: {
    _id: string;
    name: string;
    thumbnail?: {
      _id: string;
    };
  };
  substudios: {
    _id: string;
    favorite: boolean;
    bookmark: boolean;
    numScenes: number;
    name: string;
    thumbnail?: {
      _id: string;
    };
    labels: {
      _id: string;
      name: string;
      color?: string;
    }[];
  }[];
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  numScenes: number;
}
