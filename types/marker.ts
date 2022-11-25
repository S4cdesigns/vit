export interface IMarker {
  _id: string;
  name: string;
  addedOn: Date;
  favorite: boolean;
  bookmark: boolean;
  rating: number;
  scene: string;
  time: number; // Time in scene in seconds
  thumbnail?: string;
}
