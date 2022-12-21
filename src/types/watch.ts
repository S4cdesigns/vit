import { collections } from "../database";
import { generateHash } from "../utils/hash";

export default class SceneView {
  _id: string;
  date: number;
  scene: string;

  static async getByScene(sceneId: string): Promise<SceneView[]> {
    const items = await collections.views.query("scene-index", sceneId);
    return items.sort((a, b) => a.date - b.date);
  }

  static async getBySceneBulk(sceneId: string[]): Promise<Record<string, SceneView[]>> {
    return await collections.views.queryBulk("scene-index", sceneId);
  }

  static async getCount(sceneId: string): Promise<number> {
    return (await SceneView.getByScene(sceneId)).length;
  }

  static async getAll(): Promise<SceneView[]> {
    const items = await collections.views.getAll();
    return items.sort((a, b) => b.date - a.date);
  }

  constructor(sceneId: string, date: number) {
    this._id = `sc_${generateHash()}`;
    this.date = date;
    this.scene = sceneId;
  }
}
