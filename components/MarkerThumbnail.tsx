import { useContext } from "react";

import { SafeModeContext, ThemeContext } from "../pages/_app";
import { thumbnailUrl } from "../util/thumbnail";
import AutoLayout from "./AutoLayout";
import MarkerEditor from "./MarkerEditor";
import Paper from "./Paper";
import ResponsiveImage from "./ResponsiveImage";

type Props = {
  marker: { _id: string; thumbnail?: { _id: string }; time: number; name: string };
  onClick: () => void;
  onEdit: () => void;
};

export default function MarkerThumbnailCard({ marker, onEdit, onClick }: Props) {
  const { enabled: safeMode } = useContext(SafeModeContext);
  const { theme } = useContext(ThemeContext);

  return (
    <Paper style={{ position: "relative" }} onClick={onClick} className="hover">
      <ResponsiveImage
        aspectRatio="4 / 3"
        src={marker.thumbnail?._id && thumbnailUrl(marker.thumbnail._id)}
        imgStyle={{
          transition: "filter 0.15s ease-in-out",
          filter: safeMode ? "blur(20px)" : undefined,
        }}
      ></ResponsiveImage>
      <AutoLayout gap={5} style={{ padding: "6px 8px 8px 8px" }} layout="h">
        <div
          style={{
            flex: 1,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            color: undefined,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {marker.name}
        </div>
        <div
          style={{ flex: 1, justifyContent: "flex-end", textAlign: "right" }}
          onClick={(event) => {
            event.stopPropagation();
            return false;
          }}
        >
          <MarkerEditor markerId={marker._id} onEdit={onEdit} />
        </div>
      </AutoLayout>
    </Paper>
  );
}
