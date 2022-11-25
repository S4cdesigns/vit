import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import AddMarkerIcon from "mdi-react/EditIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useEffect, useState } from "react";
import Select from "react-select";

import useLabelList from "../composables/use_label_list";
import { useWindow } from "../composables/use_window";
import { markerPageFragment } from "../fragments/marker";
import ILabel from "../types/label";
import { IMarker } from "../types/marker";
import { graphqlQuery } from "../util/gql";
import { formatDuration } from "../util/string";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import Rating from "./Rating";
import Subheading from "./Subheading";
import Window from "./Window";

async function editMarker(
  id: string,
  name: string,
  rating: number,
  favorite: boolean,
  bookmark: boolean,
  labels: string[]
) {
  const query = `
  mutation ($ids: [String!]!, $opts: MarkerUpdateOpts!) {
    updateMarkers(ids: $ids, opts: $opts) {
      _id
    }
  }
 `;

  await graphqlQuery(query, {
    ids: [id],
    opts: { name, rating, favorite, bookmark, labels },
  });
}

type Props = {
  onEdit: () => void;
  markerId: string;
};

export default function MarkerEditor({ onEdit, markerId }: Props) {
  const [marker, setMarker] = useState<IMarker>();
  const [loading, setLoader] = useState(false);
  const { isOpen, close, open } = useWindow();
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

      setMarker(getMarkerById);
    };

    setLoader(true);
    loadMarker()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoader(false));
  }, [markerId, isOpen]);

  const doOpen = () => {
    open();
  };

  const setRating = (value: number) => {
    if (!marker) {
      return;
    }

    setMarker({
      ...marker,
      rating: value,
    });
  };

  const setFav = (value: boolean) => {
    if (!marker) {
      return;
    }

    setMarker({
      ...marker,
      favorite: value,
    });
  };

  const setBookmark = (value: boolean) => {
    if (!marker) {
      return;
    }

    setMarker({
      ...marker,
      bookmark: value,
    });
  };
  const setName = (event: React.FormEvent<HTMLInputElement>) => {
    if (!marker) {
      return;
    }

    setMarker({
      ...marker,
      name: event.currentTarget.value,
    });
  };

  const setSelectedLabels = (value: ILabel[]) => {
    if (!marker) {
      return;
    }

    setMarker({
      ...marker,
      labels: value,
    });
  };

  return (
    <>
      <AddMarkerIcon className="hover" size={24} onClick={doOpen} />
      <Window
        onClose={close}
        isOpen={isOpen}
        title={`Edit marker at ${formatDuration(marker?.time || 0)}`}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  if (!marker) {
                    return;
                  }

                  setLoader(true);
                  await editMarker(
                    marker?._id,
                    marker?.name,
                    marker?.rating,
                    marker?.favorite,
                    marker?.bookmark,
                    marker?.labels.map((label) => label._id)
                  );
                  onEdit();
                  close();
                } catch (error) {}
                setLoader(false);
              }}
              style={{ color: "white", background: "#3142da" }}
            >
              Edit
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
