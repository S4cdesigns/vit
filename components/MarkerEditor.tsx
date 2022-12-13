import Color from "color";
import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import AddMarkerIcon from "mdi-react/EditIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useEffect, useState } from "react";

import { useWindow } from "../composables/use_window";
import { markerPageFragment } from "../fragments/marker";
import Actor from "../src/graphql/mutations/actor";
import { IMarker } from "../types/marker";
import { graphqlQuery } from "../util/gql";
import { formatDuration } from "../util/string";
import ActorDropdownChoice, { SelectableActor } from "./ActorDropdownChoice";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import LabelDropdownChoice, { SelectableLabel } from "./LabelDropdownChoice";
import Rating from "./Rating";
import Subheading from "./Subheading";
import Window from "./Window";

async function editMarker(
  id: string,
  name: string,
  rating: number,
  favorite: boolean,
  bookmark: boolean,
  labels: string[],
  actors: string[]
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
    opts: { name, rating, favorite, bookmark, labels, actors },
  });
}

type Props = {
  onEdit: () => void;
  markerId: string;
};

export default function MarkerEditor({ onEdit, markerId }: Props) {
  const [marker, setMarker] = useState<IMarker>();
  const [loading, setLoader] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<readonly SelectableLabel[]>([]);
  const [selectedActors, setSelectedActors] = useState<readonly SelectableActor[]>([]);
  const { isOpen, close, open } = useWindow();

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
      setSelectedLabels(getMarkerById?.labels || []);
      setSelectedActors(getMarkerById?.actors || []);
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

  return (
    <>
      <AddMarkerIcon
        className="hover"
        size={24}
        onClick={(event) => {
          doOpen();
          event.stopPropagation();
          event.preventDefault();
        }}
      />
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
                    selectedLabels.map((label) => label._id),
                    selectedActors.map((actor) => actor._id)
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
