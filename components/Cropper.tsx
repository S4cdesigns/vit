import ReactCrop, { Crop, PercentCrop, PixelCrop } from "react-image-crop";

import { useSafeMode } from "../composables/use_safe_mode";

type Props = {
  src: string;
  value: Crop | undefined;
  onChange: (crop: PixelCrop, percentageCrop: PercentCrop) => void;
  onLoad: (event) => void;
  aspectRatio?: number;
  circular?: boolean;
};

export function Cropper({ circular, value, onChange, src, aspectRatio, onLoad }: Props) {
  const { blur: safeModeBlur } = useSafeMode();
  return (
    <div>
      <ReactCrop circularCrop={circular} crop={value} onChange={onChange} aspect={aspectRatio}>
        <img
          src={src}
          onLoad={onLoad}
          style={{ objectFit: "contain", width: "100%", height: "60vh", filter: safeModeBlur }}
        />
      </ReactCrop>
    </div>
  );
}

export function AvatarCropper({ value, onChange, src }: Omit<Props, "aspectRatio">) {
  return <Cropper src={src} circular value={value} onChange={onChange} aspectRatio={1} />;
}
