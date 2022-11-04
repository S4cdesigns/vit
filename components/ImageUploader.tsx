import axios from "axios";
import { useEffect, useState } from "react";
import { imageCardFragment } from "../fragments/image";
import { IImage } from "../types/image";
import { gqlIp } from "../util/ip";
import Button from "./Button";
import Card from "./Card";
import CardTitle from "./CardTitle";
import FileInput from "./FileInput";

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) resolve(reader.result.toString());
      else reject("File error");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type Props = {
  onUpload: (img: IImage[]) => void;
  scene?: string;
  actors?: string[];
  labels?: string[];
};

export default function ImageUploader({ onUpload, ...props }: Props) {
  const [uploadItems, setUploadItems] = useState<{ file: File; b64: string; name: string }[]>([]);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; b64: string; name: string }[]>([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const item = uploadQueue[0];
    if (item) {
      uploadImage(item).catch(() => {});
    } else {
      setLoader(false);
    }
  }, [uploadQueue.length]);

  async function addFiles(files: File[]) {
    for (const file of files) {
      const b64 = await readImage(file);

      if (uploadItems.find((i) => i.b64 == b64)) {
        continue;
      }

      setUploadItems((prev) => [...prev, { file, b64, name: file.name }]);
    }

    const inputEl = document.getElementById("file-input") as HTMLInputElement | undefined;
    if (inputEl) {
      inputEl.value = "";
    }
  }

  async function uploadImage(image: { file: File; b64: string; name: string }) {
    setLoader(true);
    try {
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
        scene: props.scene,
        actors: props.actors,
        labels: props.labels,
      };
      const formData = new FormData();

      const operations = JSON.stringify({ query, variables });
      formData.append("operations", operations);

      const map = {
        "0": ["variables.file"],
      };
      formData.append("map", JSON.stringify(map));

      const file = uploadQueue[0].file;
      formData.append("0", file);

      const { data } = await axios.post<{
        data: {
          uploadImage: IImage;
        };
        errors: { message: string }[];
      }>(gqlIp(), formData);
      setUploadQueue(([_, ...rest]) => rest);
      onUpload([data.data.uploadImage]);
    } catch (error) {
      setUploadQueue([]);
      setUploadItems((prev) => [...prev, ...uploadQueue]);
    }
  }

  return (
    <Card>
      <CardTitle>Upload image</CardTitle>
      <div>
        <FileInput onChange={addFiles} multiple accept={[".png", ".jpg", ".jpeg", ".webp"]} />
      </div>
      <div>
        {uploadItems.map((item, i) => (
          <div key={item.b64}>
            {item.name} <img src={item.b64} width="160" />
            <Button
              onClick={() =>
                setUploadItems((prev) => {
                  const copy = [...prev];
                  const spliced = copy.splice(i, 1);
                  return copy;
                })
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
      {loader && <div>Uploading {uploadQueue.length} images</div>}
      <div>
        <Button
          onClick={() => {
            setUploadQueue(uploadItems);
            setUploadItems([]);
          }}
        >
          Upload
        </Button>
      </div>
    </Card>
  );
}
