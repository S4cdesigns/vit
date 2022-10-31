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
  };
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  numScenes: number;
}
