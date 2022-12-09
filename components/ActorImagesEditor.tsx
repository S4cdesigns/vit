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
import { imageUrl } from "../util/thumbnail";
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
  actorId: string;
};

type ImageUploaderProps = {
  onCancel: () => void;
  onUpload: (crop: PixelCrop) => void;
  actorId: string;
  type: string;
  src: any;
};

// should only do cropping and onUpload should emit new crop dimensions to the parent component
const ImageCropper = ({ onCancel, onUpload, type, src }: ImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
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

  const doCancel = () => {
    onCancel();
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
      <div style={{ height: "100%" }}>
        <div style={{ height: "80%" }}>
          <div style={{ height: "90%", textAlign: "center" }}>
            <Cropper
              src={src}
              onLoad={onLoad}
              value={crop}
              onChange={(pixels: PixelCrop, percentage: PercentCrop) =>
                transformCrop(pixels, percentage)
              }
            />
          </div>
        </div>
        <div style={{ height: "10%" }}>
          <Button loading={loading} onClick={() => onUpload(crop)}>
            Upload
          </Button>
          <Button onClick={() => resetCrop(renderedDimensions)}>Reset crop</Button>
          <Button onClick={doCancel}>Cancel</Button>
        </div>
      </div>
    </>
  );
};

type ImageEditorProps = {
  type: string;
  image?: ActorImage;
  onRemove: () => void;
  onChange: (
    file: File,
    buffer: ArrayBuffer,
    type: string,
    name: string,
    width: number,
    height: number
  ) => void;
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
                  const file = new File([blob], image.name, {
                    type: res.headers.get("Content-Type") || "image/jpeg",
                  });

                  const reader = new FileReader();
                  reader.onload = function (e) {
                    const image = new Image();

                    image.onload = (event) => {
                      const img = event.currentTarget as HTMLImageElement;
                      const height = img.height;
                      const width = img.width;

                      onChange(file, reader.result, type, image.name, width, height);
                    };

                    image.src = reader.result;
                  };
                  reader.readAsDataURL(blob);
                });
              }}
              style={{}}
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
                    const image = new Image();

                    image.onload = (event) => {
                      const img = event.currentTarget as HTMLImageElement;
                      const height = img.height;
                      const width = img.width;

                      onChange(files[0], fileReader.result, type, image.name, width, height);
                    };

                    image.src = fileReader.result;
                  };
                  fileReader.readAsDataURL(files[0]);
                }
              }}
            >
              Change {type}
            </FileInput>
            {/* 
            <Button onClick={onChange} style={{}}>
              Change {type}
            </Button>
          */}
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
          ></div>
          <div style={{ textAlign: "center" }}>
            <FileInput
              onChange={(files) => {
                // files[0]
                // dimensions
                // imageData
                //
                /*
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
                */
              }}
            >
              Set {type}
            </FileInput>

            {/* 
            <Button onClick={onChange} style={{}}>
              Change {type}
            </Button>
            */}
          </div>
        </div>
      )}
    </>
  );
};

export default function ActorImagesEditor({ actorId }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();
  const [loading, setLoader] = useState(false);

  const [avatar, setAvatar] = useState<ActorImage>();
  const [hero, setHero] = useState<ActorImage>();
  const [altThumbnail, setAltThumbnail] = useState<ActorImage>();
  const [thumbnail, setThumbnail] = useState<ActorImage>();

  const [fileToUpload, setFileToUpload] = useState<{
    file: File;
    buffer: ArrayBuffer;
    type: string;
    name: string;
  }>();
  const [crop, setCrop] = useState<PixelCrop>();

  async function removeImage(type: string): Promise<void> {
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

    alert(type);
  }

  function changeImage(file: File, buffer: ArrayBuffer, type: string, name: string): void {
    setFileToUpload({ file, buffer, type, name });
  }

  async function onImageUpload(crop: PixelCrop, type: string) {
    if (!fileToUpload?.file) {
      return;
    }

    const uploadedImage = await uploadImage({ file: fileToUpload?.file, name: "foo" });

    switch (type) {
      case "avatar": {
        const updatedImage = await setActorAvatar(actorId, uploadedImage._id);
        setAvatar(updatedImage);
        setFileToUpload(undefined);
        break;
      }
      case "thumbnail": {
        const updatedImage = await setActorThumbnail(actorId, uploadedImage._id);
        setThumbnail(updatedImage);
        setFileToUpload(undefined);
        break;
      }
      case "altThumbnail": {
        const updatedImage = await setActorAltThumbnail(actorId, uploadedImage._id);
        setAltThumbnail(updatedImage);
        setFileToUpload(undefined);
        break;
      }
      case "hero": {
        const updatedImage = await setActorHero(actorId, uploadedImage._id);
        setHero(updatedImage);
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
          !fileToUpload && (
            <>
              <Button onClick={close}>Close</Button>
            </>
          )
        }
      >
        <div style={{ width: "80vw", height: "70vh" }}>
          {fileToUpload ? (
            <div style={{ height: "100%" }}>
              <ImageCropper
                src={fileToUpload.buffer}
                type={fileToUpload.type}
                actorId={actorId}
                onCancel={() => setFileToUpload(undefined)}
                onUpload={(crop: PixelCrop) => onImageUpload(crop, fileToUpload.type)}
              ></ImageCropper>
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
