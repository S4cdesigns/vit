import AddMarkerIcon from "mdi-react/EditIcon";
import { useEffect, useState } from "react";

import { useWindow } from "../composables/use_window";
import { scenePageFragment } from "../fragments/scene";
import { IScene } from "../types/scene";
import { graphqlQuery } from "../util/gql";
import ActorDropdownChoice, { SelectableActor } from "./ActorDropdownChoice";
import { convertTimestampToDate } from "./ActorEditor";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import Subheading from "./Subheading";
import Window from "./Window";

async function editScene(
  id: string,
  name: string,
  description: string,
  actors: string[],
  releaseDate?: number
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
    opts: { name, description, actors, releaseDate },
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

  const setReleaseDate = (releaseDate: number) => {
    if (!scene) {
      return;
    }

    setScene({
      ...scene,
      releaseDate,
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

  const setDescription = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (!scene) {
      return;
    }

    setScene({
      ...scene,
      description: event.currentTarget.value,
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
                    scene?.description || "",
                    selectedActors.map((actor) => actor._id),
                    scene?.releaseDate
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
        <div>
          <Subheading>Description</Subheading>
          <textarea
            rows={10}
            style={{ width: "100%" }}
            value={scene?.description || ""}
            onChange={setDescription}
            placeholder="Enter a description"
          />
        </div>
        <AutoLayout gap={5} layout="h">
          <div>
            <Subheading>Release date</Subheading>
            <input
              type="date"
              value={convertTimestampToDate(scene?.releaseDate)}
              onChange={(e) => setReleaseDate(new Date(e.currentTarget.value).getTime())}
            ></input>
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
