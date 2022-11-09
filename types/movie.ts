import { IActor } from "./actor";
import { IScene } from "./scene";

export interface IMovie {
  _id: string;
  name: string;
  description?: string;
  frontCover?: {
    _id: string;
    color?: string;
  };
  backCover?: {
    _id: string;
    color?: string;
  };
  spineCover?: {
    _id: string;
  };
  labels: {
    _id: string;
    name: string;
    color?: string;
  }[];
  duration: number;
  size: number;
  rating: number;
  favorite: boolean;
  bookmark: boolean;
  releaseDate?: number;
  actors: IActor[];
  studio?: {
    _id: string;
    name: string;
    thumbnail?: {
      _id: string;
    };
  };
  scenes: IScene[];
}
