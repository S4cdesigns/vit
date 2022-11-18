import axios from "axios";

import { imageCardFragment } from "../../fragments/image";
import { IImage } from "../../types/image";
import { gqlIp } from "../ip";

export async function uploadImage(image: { file: File; name: string }) {
  const query = `
      mutation (
        $file: Upload!
        $name: String
        $scene: String
        $actors: [String!]
        $labels: [String!]
      ) {
        uploadImage(file: $file, name: $name, scene: $scene, actors: $actors, labels: $labels) {
          ...ImageCard
        }
      }
      ${imageCardFragment}
    `;
  const variables = {
    name: image.name,
    /*  scene: props.scene,
    actors: props.actors,
    labels: props.labels, */
  };
  const formData = new FormData();

  const operations = JSON.stringify({ query, variables });
  formData.append("operations", operations);

  const map = {
    "0": ["variables.file"],
  };
  formData.append("map", JSON.stringify(map));

  const file = image.file;
  formData.append("0", file);

  const { data } = await axios.post<{
    data: {
      uploadImage: IImage;
    };
    errors: { message: string }[];
  }>(gqlIp(), formData, {
    headers: {
      "apollo-require-preflight": "true",
    },
  });

  return data.data.uploadImage;
}
