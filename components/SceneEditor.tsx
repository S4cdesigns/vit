import BookmarkIcon from "mdi-react/BookmarkIcon";
import BookmarkBorderIcon from "mdi-react/BookmarkOutlineIcon";
import AddMarkerIcon from "mdi-react/EditIcon";
import HeartIcon from "mdi-react/HeartIcon";
import HeartBorderIcon from "mdi-react/HeartOutlineIcon";
import { useEffect, useState } from "react";

import { useWindow } from "../composables/use_window";
import { scenePageFragment } from "../fragments/scene";
import { IScene } from "../types/scene";
import { graphqlQuery } from "../util/gql";
import ActorDropdownChoice, { SelectableActor } from "./ActorDropdownChoice";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import Rating from "./Rating";
import Subheading from "./Subheading";
import Window from "./Window";

async function editScene(
  id: string,
  name: string,
  rating: number,
  favorite: boolean,
  bookmark: boolean,
  actors: string[]
) {
  const query = `
  mutation ($ids: [String!]!, $opts: SceneUpdateOpts!) {
    updateScenes(ids: $ids, opts: $opts) {
      _id
    }
  }
 `;

  await graphqlQuery(query, {
    ids: [id],
    opts: { name, rating, favorite, bookmark, actors },
  });
}

type Props = {
  onEdit: () => void;
  sceneId: string;
};

export default function SceneEditor({ onEdit, sceneId }: Props) {
  const [scene, setScene] = useState<IScene>();
  const [loading, setLoader] = useState(false);
  const [selectedActors, setSelectedActors] = useState<readonly SelectableActor[]>([]);
  const { isOpen, close, open } = useWindow();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadScene = async () => {
      const q = `
  query ($id: String!) {
    getSceneById(id: $id) {
      ...ScenePage
    }
  }
  ${scenePageFragment}
  `;

      const { getSceneById } = await graphqlQuery<{
        getSceneById: IScene;
      }>(q, {
        id: sceneId,
      });

      setScene(getSceneById);
      setSelectedActors(getSceneById?.actors || []);
    };

    setLoader(true);
    loadScene()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoader(false));
  }, [sceneId, isOpen]);

  const doOpen = () => {
    open();
  };

  const setRating = (value: number) => {
    if (!scene) {
      return;
    }

    setScene({
      ...scene,
      rating: value,
    });
  };

  const setFav = (value: boolean) => {
    if (!scene) {
      return;
    }

    setScene({
      ...scene,
      favorite: value,
    });
  };

  const setBookmark = (value: boolean) => {
    if (!scene) {
      return;
    }

    setScene({
      ...scene,
      bookmark: value,
    });
  };
  const setName = (event: React.FormEvent<HTMLInputElement>) => {
    if (!scene) {
      return;
    }

    setScene({
      ...scene,
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
        title={`Edit scene`}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  if (!scene) {
                    return;
                  }

                  setLoader(true);
                  await editScene(
                    scene?._id,
                    scene?.name,
                    scene?.rating,
                    scene?.favorite,
                    scene?.bookmark,
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
            value={scene?.name || ""}
            onChange={setName}
            placeholder="Enter a scene title"
            type="text"
          />
        </div>
        <AutoLayout gap={5} layout="h">
          <div>
            <Rating value={scene?.rating || 0} onChange={setRating} />
          </div>
          <div>
            {scene?.favorite ? (
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
            {scene?.bookmark ? (
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
      </Window>
    </>
  );
}
