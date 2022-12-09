import axios from "axios";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import {
  centerCrop,
  convertToPixelCrop,
  Crop,
  makeAspectCrop,
  PercentCrop,
  PixelCrop,
} from "react-image-crop";

import { useSafeMode } from "../composables/use_safe_mode";
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
import { thumbnailUrl } from "../util/thumbnail";
import Button from "./Button";
import { Cropper } from "./Cropper";
import FileInput from "./FileInput";
import Window from "./Window";

async function uploadImage(
  image: { file: File; name: string },
  crop?: PixelCrop,
  actorId?: string
) {
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
    crop: crop
      ? {
          left: Math.round(crop.x),
          top: Math.round(crop.y),
          width: Math.round(crop.width),
          height: Math.round(crop.height),
        }
      : undefined,
    actors: [actorId],
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

type ActorImage = Pick<IImage, "_id" | "name">;

type ActorImages = {
  altThumbnail?: ActorImage;
  thumbnail?: ActorImage;
  hero?: ActorImage;
  avatar?: ActorImage;
};

// type ActorImages = Pick<IActor, "_id" | "altThumbnail" | "thumbnail" | "hero" | "avatar">;

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

type Props = {
  onEdit: () => void;
  actorId: string;
};

type ImageUploaderProps = {
  onCancel: () => void;
  onUpload: (imageId: string) => void;
  actorId: string;
  type: string;
};

const ImageUploader = ({ onCancel, onUpload, actorId, type }: ImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File>();
  // actual dimensions of the image
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [renderedDimensions, setRenderedDimensions] = useState({ width: 0, height: 0 });
  const [imageData, setImageData] = useState<ArrayBuffer | string>();
  // percentage crop of the selection
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
  // real crop based on dimensions of the actual image in px
  const [realCrop, setRealCrop] = useState<PixelCrop>();

  const convertCrop = (crop: PercentCrop) => {
    // crop from the component is in percentage, since the crop component uses
    // the dimensions of the rendered image, not the original image
    // convert to real dimensions of the image for the backend
    setRealCrop({
      unit: "px",
      x: Math.round((dimensions.width / 100) * crop.x),
      y: Math.round((dimensions.height / 100) * crop.y),
      width: Math.round((dimensions.width / 100) * crop.width),
      height: Math.round((dimensions.height / 100) * crop.height),
    });
  };

  const transformCrop = (crop: PixelCrop, percentageCrop: PercentCrop) => {
    setCrop(crop);
    convertCrop(percentageCrop);
  };

  const resetCrop = (resetDimensions: { width: number; height: number }) => {
    let aspect = 3 / 4;

    switch (type) {
      case "hero":
        aspect = 2.75 / 1;
        break;
      case "avatar":
        aspect = 1 / 1;
        break;
    }

    // maintain aspect ratio - probably not working with that library easily
    // https://github.com/DominicTobias/react-image-crop/issues/514
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 100,
        },
        aspect,
        resetDimensions.width,
        resetDimensions.height
      ),
      resetDimensions.width,
      resetDimensions.height
    );

    setCrop(convertToPixelCrop(crop, resetDimensions.width, resetDimensions.height));
    convertCrop(crop);
  };

  const upload = async () => {
    if (fileToUpload) {
      setLoading(true);
      const result = await uploadImage(
        { file: fileToUpload, name: fileToUpload.name },
        realCrop,
        actorId
      );
      setLoading(false);
      onUpload(result._id);
    }
  };

  const doCancel = () => {
    onCancel();
    setFileToUpload(undefined);
    setImageData(undefined);
    setCrop({ unit: "%", width: 100, height: 100, x: 0, y: 0 });
    setRealCrop({ unit: "px", width: 100, height: 100, x: 0, y: 0 });
  };

  const onLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setRenderedDimensions({ width: event.currentTarget.width, height: event.currentTarget.height });
    resetCrop({ width: event.currentTarget.width, height: event.currentTarget.height });
  };

  return (
    <>
      {fileToUpload ? (
        <div style={{ height: "100%" }}>
          <div style={{ height: "80%" }}>
            <div style={{ height: "90%", textAlign: "center" }}>
              <Cropper
                src={imageData}
                onLoad={onLoad}
                value={crop}
                onChange={(pixels: PixelCrop, percentage: PercentCrop) =>
                  transformCrop(pixels, percentage)
                }
              />
            </div>
          </div>
          <div style={{ height: "10%" }}>
            <Button loading={loading} onClick={upload}>
              Upload
            </Button>
            <Button onClick={() => resetCrop(renderedDimensions)}>Reset crop</Button>
            <Button onClick={doCancel}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div style={{ height: "100%", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <FileInput
              onChange={(files) => {
                setFileToUpload(files[0]);

                if (files && files.length) {
                  const fileReader = new FileReader();
                  fileReader.onload = () => {
                    if (!fileReader.result) {
                      return;
                    }
                    const image = new Image();

                    image.onload = (event) => {
                      const img = event.currentTarget as HTMLImageElement;
                      const height = img.height;
                      const width = img.width;

                      setDimensions({ height, width });
                      resetCrop({ height, width });
                    };

                    image.src = fileReader.result;
                    setImageData(fileReader.result);
                  };
                  fileReader.readAsDataURL(files[0]);
                }
              }}
            />
          </div>
          <Button style={{ position: "absolute", bottom: 0, left: 0 }} onClick={doCancel}>
            Cancel
          </Button>
        </div>
      )}
    </>
  );
};

type ImageEditorProps = {
  type: string;
  image?: ActorImage;
  onRemove: () => void;
  onChange: () => void;
};

const ImageEditor = ({ type, image, onRemove, onChange }: ImageEditorProps) => {
  const { blur: safeModeBlur } = useSafeMode();
  return (
    <>
      {image?._id ? (
        <div>
          <div>
            <img
              src={thumbnailUrl(image._id)}
              style={{ filter: safeModeBlur, objectFit: "contain", width: "100%", height: "20vh" }}
            />
          </div>
          <div>
            <Button onClick={onRemove} style={{}}>
              Remove
            </Button>
            <Button onClick={onChange} style={{}}>
              Change {type}
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            height: "100%",
            background: `repeating-linear-gradient(
                  45deg,
                  #a0a0a005,
                  #a0a0a005 10px,
                  #a0a0a010 10px,
                  #a0a0a010 20px
                )`,
            border: "2px solid #a0a0a020",
          }}
        >
          <Button onClick={onChange} style={{}}>
            Change {type}
          </Button>
        </div>
      )}
    </>
  );
};

export default function ActorImagesEditor({ onEdit, actorId }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();
  const [loading, setLoader] = useState(false);

  const [avatar, setAvatar] = useState<ActorImage>();
  const [hero, setHero] = useState<ActorImage>();
  const [altThumbnail, setAltThumbnail] = useState<ActorImage>();
  const [thumbnail, setThumbnail] = useState<ActorImage>();

  const [newImage, setNewImage] = useState<string>();
  const [currentFile, setCurrentFile] = useState();

  async function removeImage(type: string): Promise<void> {
    alert("remove");
  }

  async function changeImage(type: string): Promise<void> {
    setNewImage(type);
  }

  async function onImageUpload(type: string, id: string, name: string) {
    switch (type) {
      case "avatar":
        await setActorAvatar(actorId, id);
        setAvatar({ _id: id, name: "foo" });
        setNewImage(undefined);
        break;
      case "thumbnail":
        await setActorThumbnail(actorId, id);
        setThumbnail({ _id: id, name: "foo" });
        setNewImage(undefined);
        break;
      case "altThumbnail":
        await setActorAltThumbnail(actorId, id);
        setAltThumbnail({ _id: id, name: "foo" });
        setNewImage(undefined);
        break;
      case "hero":
        await setActorHero(actorId, id);
        setHero({ _id: id, name: "foo" });
        setNewImage(undefined);
        break;
    }
  }

  useEffect(() => {
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
      });
  }, []);

  return (
    <>
      <Button onClick={open} className="hover">
        Manage images
      </Button>
      <Window
        onClose={close}
        isOpen={isOpen}
        title={t("actions.edit")}
        actions={
          !newImage && (
            <>
              <Button onClick={close}>Close</Button>
            </>
          )
        }
      >
        <div style={{ width: "80vw", height: "70vh" }}>
          {newImage ? (
            <div style={{ height: "100%" }}>
              <ImageUploader
                type={newImage}
                actorId={actorId}
                onCancel={() => setNewImage(undefined)}
                onUpload={(id: string) => onImageUpload(newImage, id)}
              ></ImageUploader>
            </div>
          ) : (
            <div style={{ height: "100%" }}>
              <div style={{ height: "50%", marginBottom: 10 }}>
                <ImageEditor
                  type="hero"
                  image={hero}
                  onChange={async () => changeImage("hero")}
                  onRemove={async () => removeImage("hero")}
                />
              </div>
              <div style={{ height: "50%" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: 10, height: "100%" }}>
                  <div style={{ flex: 1 }}>
                    <ImageEditor
                      type="avatar"
                      image={avatar}
                      onChange={async () => changeImage("avatar")}
                      onRemove={async () => removeImage("avatar")}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <ImageEditor
                      type="thumbnail"
                      image={thumbnail}
                      onChange={async () => changeImage("thumbnail")}
                      onRemove={async () => removeImage("thumbnail")}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <ImageEditor
                      type="altThumbnail"
                      image={altThumbnail}
                      onChange={async () => changeImage("altThumbnail")}
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
