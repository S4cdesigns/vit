import "react-advanced-cropper/dist/style.css";

import React, { useRef } from "react";
import {
  CircleStencil,
  Cropper,
  CropperRef,
  DefaultSize,
  ImageRestriction,
  RectangleStencil,
} from "react-advanced-cropper";

import Button from "./Button";

type imageTypes = "avatar" | "thumbnail" | "altThumbnail" | "hero";

type ImageCropperProps = {
  onCancel: () => void;
  onUpload: (blob: Blob) => void;
  src?: string;
  aspectRatio: number;
  loading: boolean;
};

// should only do cropping and onUpload should emit new crop dimensions to the parent component
export const ImageCropper = ({
  onCancel,
  onUpload,
  src,
  aspectRatio,
  loading,
}: ImageCropperProps) => {
  const cropperRef = useRef<CropperRef>(null);

  const doCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current?.getCanvas();
      if (canvas == null) {
        return;
      }
      canvas.toBlob((blob) => {
        if (blob !== null) {
          onUpload(blob);
        }
      });
    }
  };

  let stencil = RectangleStencil;

  if (aspectRatio === 1) {
    stencil = CircleStencil;
  }

  const defaultSize = ({
    imageSize,
    visibleArea,
  }: {
    imageSize: { width: number; height: number };
    visibleArea: { width: number; height: number };
  }) => {
    return { width: (visibleArea || imageSize).width, height: (visibleArea || imageSize).height };
  };

  return (
    <>
      <div style={{ height: "100%" }}>
        <div style={{ height: "80%" }}>
          <div style={{ height: "90%", textAlign: "center" }}>
            <Cropper
              defaultSize={defaultSize as DefaultSize}
              stencilComponent={stencil}
              src={src}
              ref={cropperRef}
              stencilProps={{
                aspectRatio,
                grid: true,
              }}
              imageRestriction={ImageRestriction.fitArea}
            />
          </div>
        </div>
        <div style={{ height: "10%" }}>
          <Button onClick={doCrop} loading={loading}>
            Upload
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </>
  );
};
