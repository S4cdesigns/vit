import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import AddMarkerIcon from "mdi-react/PlaylistAddIcon";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useVideoControls } from "../composables/use_video_control";
import { useWindow } from "../composables/use_window";
import { IActor } from "../types/actor";
import { graphqlQuery } from "../util/gql";
import { formatDuration } from "../util/string";
import ActorDropdownChoice, { SelectableActor } from "./ActorDropdownChoice";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import LabelDropdownChoice, { SelectableLabel } from "./LabelDropdownChoice";
import Rating from "./Rating";
import Subheading from "./Subheading";
import Window from "./Window";

async function createMarker(
  name: string,
  scene: string,
  time: number,
  rating: number,
  favorite: boolean,
  bookmark: boolean,
  labels: string[],
  actors?: string[]
) {
  const query = `
  mutation ($name: String!, $scene: String!, $time: Int!, $rating: Int, $favorite: Boolean, $bookmark: Long, $labels: [String!]!, $actors: [String!]!) {
    createMarker(name: $name, scene: $scene, time: $time, rating: $rating, favorite: $favorite, bookmark: $bookmark, labels: $labels, actors: $actors) {
      _id
    }
  }
        `;

  await graphqlQuery(query, {
    name,
    labels,
    scene,
    time,
    rating,
    favorite,
    bookmark,
    actors,
  });
}

type Props = {
  onCreate: () => void;
  sceneId: string;
  actors: IActor[];
  onOpen: () => void;
};

export default function MarkerCreator({ onCreate, onOpen, sceneId, actors }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [fav, setFav] = useState(false);
  const [bookmark, setBookmark] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<readonly SelectableLabel[]>([]);
  const [selectedActors, setSelectedActors] = useState<readonly SelectableActor[]>(actors);
  const { currentTime } = useVideoControls();

  const [loading, setLoader] = useState(false);

  const doOpen = () => {
    open();
    onOpen();
  };

  return (
    <>
      <AddMarkerIcon className="hover" size={24} onClick={doOpen} />
      <Window
        onClose={close}
        isOpen={isOpen}
        title={`Add marker at ${formatDuration(currentTime)}`}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  await createMarker(
                    name,
                    sceneId,
                    parseInt(currentTime, 10),
                    rating,
                    fav,
                    bookmark,
                    selectedLabels.map(({ _id }) => _id),
                    selectedActors.map(({ _id }) => _id)
                  );
                  onCreate();
                  close();
                  setName("");
                  setSelectedLabels([]);
                } catch (error) {}
                setLoader(false);
              }}
              style={{ color: "white", background: "#3142da" }}
            >
              Create
            </Button>
            <Button onClick={close}>Close</Button>
          </>
        }
      >
        <div>
          <input
            style={{ width: "100%" }}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter a marker title"
            type="text"
          />
        </div>
        <AutoLayout gap={5} layout="h">
          <div>
            <Rating value={rating} onChange={setRating} />
          </div>
          <div>
            {fav ? (
              <HeartIcon
                onClick={() => setFav(false)}
                className="hover"
                style={{ fontSize: 28, color: "#ff3355" }}
              />
            ) : (
              <HeartBorderIcon
                onClick={() => setFav(true)}
                className="hover"
                style={{ fontSize: 28, color: "#ff3355" }}
              />
            )}
            {bookmark ? (
              <BookmarkIcon
                onClick={() => setBookmark(false)}
                className="hover"
                style={{ fontSize: 28 }}
              />
            ) : (
              <BookmarkBorderIcon
                onClick={() => setBookmark(true)}
                className="hover"
                style={{ fontSize: 28 }}
              />
            )}
          </div>
        </AutoLayout>
        <div>
          <Subheading>Actors</Subheading>
          <ActorDropdownChoice selectedActors={selectedActors} onChange={setSelectedActors} />
        </div>
        <div>
          <Subheading>Labels</Subheading>
          <LabelDropdownChoice selectedLabels={selectedLabels} onChange={setSelectedLabels} />
        </div>
      </Window>
    </>
  );
}
