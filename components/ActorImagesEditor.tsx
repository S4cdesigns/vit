import "react-advanced-cropper/dist/style.css";

import axios from "axios";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

import { useSafeMode } from "../composables/use_safe_mode";
import { useSettings } from "../composables/use_settings";
import { useWindow } from "../composables/use_window";
import { imageCardFragment } from "../fragments/image";
import { IImage } from "../types/image";
import { graphqlQuery } from "../util/gql";
import { gqlIp } from "../util/ip";
import {
  setActorAltThumbnail,
  setActorAvatar,
  setActorHero,
  setActorThumbnail,
} from "../util/mutations/actor";
import { imageUrl } from "../util/thumbnail";
import Button from "./Button";
import { ImageCropper } from "./Cropper";
import FileInput from "./FileInput";
import Window from "./Window";

type imageTypes = "avatar" | "thumbnail" | "altThumbnail" | "hero";

async function uploadImage(image: { blob: Blob; name: string }, actorId?: string) {
  const query = `
      mutation (
        $file: Upload!
        $name: String
        $actors: [String!]
        $crop: Crop
      ) {
        uploadImage(file: $file, name: $name, actors: $actors, crop: $crop) {
          ...ImageCard
        }
      }
      ${imageCardFragment}
    `;
  const variables = {
    name: image.name,
    actors: [actorId],
  };
  const formData = new FormData();

  const operations = JSON.stringify({ query, variables });
  formData.append("operations", operations);

  const map = {
    "0": ["variables.file"],
  };
  formData.append("map", JSON.stringify(map));
  formData.append("0", image.blob);

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

type ActorImage = Pick<IImage, "_id" | "name">;

type ActorImages = {
  altThumbnail?: ActorImage;
  thumbnail?: ActorImage;
  hero?: ActorImage;
  avatar?: ActorImage;
};

async function loadActor(actorId: string): Promise<ActorImages> {
  const q = `
  query ($id: String!) {
    getActorById(id: $id) {
      _id
      thumbnail {
        _id
        name
        color
      }
      avatar {
        _id
        name
        color
      }
      altThumbnail {
        _id
        name
        color
      }
      hero {
        _id
        name
        color
      }
    }
  }
  `;

  const { getActorById } = await graphqlQuery<{
    getActorById: ActorImages;
  }>(q, {
    id: actorId,
  });

  return {
    thumbnail: getActorById.thumbnail,
    altThumbnail: getActorById.altThumbnail,
    hero: getActorById.hero,
    avatar: getActorById.avatar,
  };
}

type ImageEditorProps = {
  type: imageTypes;
  image?: ActorImage;
  onRemove: () => void;
  onChange: (buffer: ArrayBuffer, type: imageTypes, name: string) => void;
};

const ImageEditControls = ({ type, image, onRemove, onChange }: ImageEditorProps) => {
  const { blur: safeModeBlur } = useSafeMode();

  return (
    <>
      {image?._id ? (
        <div>
          <div>
            <img
              src={imageUrl(image._id)}
              style={{ filter: safeModeBlur, objectFit: "contain", width: "100%", height: "30vh" }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <Button onClick={onRemove} style={{}}>
              Remove
            </Button>
            <Button
              onClick={async () => {
                await fetch(imageUrl(image._id)).then(async function (res) {
                  const blob = await res.blob();
                  const reader = new FileReader();
                  reader.onload = function (e) {
                    onChange(reader.result as ArrayBuffer, type, image.name);
                  };
                  reader.readAsDataURL(blob);
                });
              }}
            >
              Edit
            </Button>

            <FileInput
              onChange={(files) => {
                if (files && files.length) {
                  const fileReader = new FileReader();
                  fileReader.onload = () => {
                    if (!fileReader.result) {
                      return;
                    }
                    onChange(fileReader.result as ArrayBuffer, type, image.name);
                  };
                  fileReader.readAsDataURL(files[0]);
                }
              }}
            >
              Change {type}
            </FileInput>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              height: "30vh",
              background: `repeating-linear-gradient(
                  45deg,
                  #a0a0a005,
                  #a0a0a005 10px,
                  #a0a0a010 10px,
                  #a0a0a010 20px
                )`,
              border: "2px solid #a0a0a020",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <FileInput
              onChange={(files) => {
                if (files && files.length) {
                  const fileReader = new FileReader();
                  fileReader.onload = () => {
                    if (!fileReader.result) {
                      return;
                    }
                    onChange(fileReader.result as ArrayBuffer, type, files[0].name);
                  };
                  fileReader.readAsDataURL(files[0]);
                }
              }}
            >
              Set {type}
            </FileInput>
          </div>
        </div>
      )}
    </>
  );
};

type ActorImagesEditorProps = {
  actorId: string;
  onClose?: () => void;
};

export default function ActorImagesEditor({ actorId, onClose }: ActorImagesEditorProps) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();
  const [_loading, setLoader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { actorImageAspect } = useSettings();

  const [avatar, setAvatar] = useState<ActorImage>();
  const [aspect, setAspect] = useState<number>(9 / 16);
  const [hero, setHero] = useState<ActorImage>();
  const [altThumbnail, setAltThumbnail] = useState<ActorImage>();
  const [thumbnail, setThumbnail] = useState<ActorImage>();

  const doClose = () => {
    close();
    onClose?.();
  };

  const [fileToUpload, setFileToUpload] = useState<{
    buffer: ArrayBuffer;
    type: imageTypes;
    name: string;
  }>();

  async function removeImage(type: string): Promise<void> {
    if (!window.confirm(`Are your sure to remove the ${type} image?`)) {
      return;
    }

    switch (type) {
      case "avatar":
        await setActorAvatar(actorId, null);
        setAvatar(undefined);
        setFileToUpload(undefined);
        break;
      case "thumbnail":
        await setActorThumbnail(actorId, null);
        setThumbnail(undefined);
        setFileToUpload(undefined);
        break;
      case "altThumbnail":
        await setActorAltThumbnail(actorId, null);
        setAltThumbnail(undefined);
        setFileToUpload(undefined);
        break;
      case "hero":
        await setActorHero(actorId, null);
        setHero(undefined);
        setFileToUpload(undefined);
        break;
    }
  }

  function changeImage(buffer: ArrayBuffer, type: imageTypes, name: string): void {
    setFileToUpload({ buffer, type, name });
  }

  async function onImageUpload(blob: Blob, type: string) {
    if (!fileToUpload?.buffer) {
      return;
    }

    setUploading(true);
    const uploadedImage = await uploadImage({ blob: blob, name: fileToUpload.name }, actorId);
    setUploading(false);

    switch (type) {
      case "avatar": {
        const newImage = await setActorAvatar(actorId, uploadedImage._id);
        setAvatar(newImage);
        setFileToUpload(undefined);
        break;
      }
      case "thumbnail": {
        const newImage = await setActorThumbnail(actorId, uploadedImage._id);
        setThumbnail(newImage);
        setFileToUpload(undefined);
        break;
      }
      case "altThumbnail": {
        const newImage = await setActorAltThumbnail(actorId, uploadedImage._id);
        setAltThumbnail(newImage);
        setFileToUpload(undefined);
        break;
      }
      case "hero": {
        const newImage = await setActorHero(actorId, uploadedImage._id);
        setHero(newImage);
        setFileToUpload(undefined);
        break;
      }
    }
  }

  useEffect(() => {
    setLoader(true);
    loadActor(actorId)
      .then((result) => {
        if (result.avatar) {
          setAvatar(result.avatar);
        } else {
          setAvatar(undefined);
        }

        if (result.hero) {
          setHero(result.hero);
        } else {
          setHero(undefined);
        }

        if (result.thumbnail) {
          setThumbnail(result.thumbnail);
        } else {
          setThumbnail(undefined);
        }

        if (result.altThumbnail) {
          setAltThumbnail(result.altThumbnail);
        } else {
          setAltThumbnail(undefined);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoader(false));
  }, []);

  useEffect(() => {
    switch (fileToUpload?.type) {
      case "hero":
        setAspect(2.75 / 1);
        break;
      case "thumbnail":
      case "altThumbnail":
        setAspect(actorImageAspect.numericValue);
        break;
      case "avatar":
        setAspect(1 / 1);
        break;
    }
  }, [fileToUpload?.type]);

  return (
    <>
      <Button onClick={open} className="hover">
        Manage images
      </Button>
      <Window
        onClose={doClose}
        isOpen={isOpen}
        title={t("actions.edit")}
        actions={
          !fileToUpload && (
            <>
              <Button onClick={doClose}>Close</Button>
            </>
          )
        }
      >
        <div style={{ width: "80vw", height: "70vh" }}>
          {fileToUpload ? (
            <div style={{ height: "100%" }}>
              <ImageCropper
                aspectRatio={aspect}
                src={fileToUpload.buffer}
                loading={uploading}
                onCancel={() => setFileToUpload(undefined)}
                onUpload={(blob: Blob) => onImageUpload(blob, fileToUpload.type)}
              />
            </div>
          ) : (
            <div style={{ height: "100%" }}>
              <div style={{ height: "50%", marginBottom: 20 }}>
                <ImageEditControls
                  type="hero"
                  image={hero}
                  onChange={changeImage}
                  onRemove={async () => removeImage("hero")}
                />
              </div>
              <div style={{ height: "50%" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: 10, height: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <ImageEditControls
                      type="avatar"
                      image={avatar}
                      onChange={changeImage}
                      onRemove={async () => removeImage("avatar")}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <ImageEditControls
                      type="thumbnail"
                      image={thumbnail}
                      onChange={changeImage}
                      onRemove={async () => removeImage("thumbnail")}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <ImageEditControls
                      type="altThumbnail"
                      image={altThumbnail}
                      onChange={changeImage}
                      onRemove={async () => removeImage("altThumbnail")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Window>
    </>
  );
}
