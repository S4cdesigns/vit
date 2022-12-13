import { IActor } from "./actor";
import { IImage } from "./image";
import ILabel from "./label";
import { IScene } from "./scene";

export interface IMarker {
  _id: string;
  name: string;
  addedOn: Date;
  favorite: boolean;
  bookmark: boolean;
  actors: IActor[];
  labels: ILabel[];
  rating: number;
  scene: IScene;
  time: number; // Time in scene in seconds
  thumbnail?: IImage;
}
