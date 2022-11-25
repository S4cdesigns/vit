import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import AddMarkerIcon from "mdi-react/PlaylistAddIcon";
import { useTranslations } from "next-intl";
import { useContext, useEffect, useState } from "react";
import Select from "react-select";

import useLabelList from "../composables/use_label_list";
import { useWindow } from "../composables/use_window";
import { markerPageFragment } from "../fragments/marker";
import { VideoContext } from "../pages/_app";
import ILabel from "../types/label";
import { IMarker } from "../types/marker";
import { graphqlQuery } from "../util/gql";
import { formatDuration } from "../util/string";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
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
    createMarker(name: $name, sceke: $scene, time: $time, rating: $rating, favorite: $favorite, bookmark: $bookmark, labels: $labels, actors: $actors) {
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
  onOpen: () => void;
  markerId: string;
};

export default function MarkerEditor({ onCreate, onOpen, markerId }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();

  console.log("render editor");
  const [marker, setMarker] = useState<IMarker>();

  const [loading, setLoader] = useState(false);
  const { labels } = useLabelList();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadMarker = async () => {
      const q = `
  query ($id: String!) {
    getMarkerById(id: $id) {
      ...MarkerPage
    }
  }
  ${markerPageFragment}
  `;

      const { getMarkerById } = await graphqlQuery<{
        getMarkerById: IMarker;
      }>(q, {
        id: markerId,
      });

      console.log("set marker", getMarkerById);
      setMarker(getMarkerById);
    };

    loadMarker().catch((error) => {
      console.error(error);
    });
  }, [markerId, isOpen]);

  const doOpen = () => {
    open();
  };
  console.log("render marker", marker);

  const setRating = (value) => {};
  const setFav = (value) => {};
  const setBookmark = (value) => {};
  const setName = (value) => {};
  const setSelectedLabels = (value) => {};

  return (
    <>
      <AddMarkerIcon className="hover" size={24} onClick={doOpen} />
      <Window
        onClose={close}
        isOpen={isOpen}
        title={`Add marker at ${formatDuration(marker?.time || 0)}`}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  /*
                  await createMarker(
                    name,
                    sceneId,
                    Math.floor(currentTime),
                    rating,
                    fav,
                    bookmark,
                    selectedLabels.map(({ _id }) => _id),
                    actorIds
                  );
                  */
                  onCreate();
                  close();
                  // setName("");
                  // setSelectedLabels([]);
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
            value={marker?.name || ""}
            onChange={setName}
            placeholder="Enter a marker title"
            type="text"
          />
        </div>
        <AutoLayout gap={5} layout="h">
          <div>
            <Rating value={marker?.rating || 0} onChange={setRating} />
          </div>
          <div>
            {marker?.favorite ? (
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
            {marker?.bookmark ? (
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
          <Subheading>Labels</Subheading>
          <Select
            value={marker?.labels}
            onChange={setSelectedLabels}
            closeMenuOnSelect={false}
            isClearable
            styles={{
              container: (provided) => ({
                ...provided,
                maxWidth: 400,
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
              multiValue: (styles, { data }) => {
                return {
                  ...styles,
                  backgroundColor: data.color || "black",
                  borderRadius: 4,
                };
              },
              multiValueLabel: (styles, { data }) => ({
                ...styles,
                color: new Color(data.color || "#000000").isLight() ? "black" : "white",
              }),
            }}
            filterOption={({ data: label }, query) => label.name.toLowerCase().includes(query)}
            isMulti
            options={labels}
            getOptionLabel={(label) => label.name}
            getOptionValue={(label) => label._id}
          />
        </div>
      </Window>
    </>
  );
}
