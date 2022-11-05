import axios from "axios";
import { useEffect, useState } from "react";
import { useWindow } from "../composables/use_window";
import { imageCardFragment } from "../fragments/image";
import { IImage } from "../types/image";
import { gqlIp } from "../util/ip";
import Button from "./Button";
import CloseIcon from "mdi-react/CloseIcon";
import FileInput from "./FileInput";
import Window from "./Window";
import { useTranslations } from "next-intl";

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
  onDone?: () => void;
  scene?: string;
  actors?: string[];
  labels?: string[];
};

export default function ImageUploader({ onUpload, onDone, ...props }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();

  const [uploadItems, setUploadItems] = useState<{ file: File; b64: string; name: string }[]>([]);
  const [uploadQueue, setUploadQueue] = useState<{ file: File; b64: string; name: string }[]>([]);
  const [loading, setLoader] = useState(false);

  useEffect(() => {
    const item = uploadQueue[0];
    if (item) {
      uploadImage(item).catch(() => {});
    } else {
      setLoader(false);
      onDone?.();
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

  function spliceImage(index: number): void {
    setUploadItems((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  return (
    <>
      <Button onClick={open} style={{ marginRight: 10 }}>
        {t("actions.upload")}
      </Button>
      <Window
        actions={
          <>
            <Button
              loading={loading}
              onClick={() => {
                setUploadQueue(uploadItems);
                setUploadItems([]);
              }}
            >
              {t("actions.upload")}
            </Button>
          </>
        }
        isOpen={isOpen}
        onClose={close}
        title={t("actions.uploadImages")}
      >
        <div>
          <FileInput onChange={addFiles} multiple accept={[".png", ".jpg", ".jpeg", ".webp"]} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${175}px, 1fr))`,
            gridGap: 2,
            maxHeight: "50vh",
            overflowY: "scroll",
          }}
        >
          {uploadItems.map((item, i) => (
            <div style={{ position: "relative" }}>
              {/* base64 as key is OK because of addFiles function */}
              <img src={item.b64} width="100%" height="175" style={{ objectFit: "contain" }} />
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon onClick={() => spliceImage(i)} className="hover" size={32} />
              </div>
            </div>
          ))}
        </div>
        {loading && <div>Uploading {uploadQueue.length} images</div>}
      </Window>
    </>
  );
}
