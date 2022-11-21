import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect } from "react";
import AutoLayout from "../../components/AutoLayout";
import CardTitle from "../../components/CardTitle";
import ListWrapper from "../../components/ListWrapper";
import PageWrapper from "../../components/PageWrapper";
import SceneCard from "../../components/SceneCard";
import StudioCard from "../../components/StudioCard";
import { usePaginatedList } from "../../composables/use_paginated_list";
import { useSceneList } from "../../composables/use_scene_list";
import { useStudioList } from "../../composables/use_studio_list";
import { studioCardFragment } from "../../fragments/studio";

import { IStudio } from "../../types/studio";
import { graphqlQuery } from "../../util/gql";
import { thumbnailUrl } from "../../util/thumbnail";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const q = `
  query ($id: String!) {
    getStudioById(id: $id) {
      ...StudioCard
      aliases
      substudios {
        ...StudioCard
      }
    }
  }
  ${studioCardFragment}
  `;

  const { getStudioById } = await graphqlQuery<{
    getStudioById: IStudio;
  }>(q, {
    id: ctx.query.id,
  });

  return {
    props: {
      studio: getStudioById,
    },
  };
};
export default function StudioPage({ studio }: { studio: IStudio }) {
  const { studios, editStudio } = useStudioList(
    {
      items: studio.substudios,
      numItems: studio.substudios.length,
      numPages: 1,
    },
    {}
  );
  const {
    scenes,
    numItems: numScenes,
    // numPages: numScenePages,
    loading: sceneLoader,
    fetchScenes,
    editScene,
  } = useSceneList(
    {
      items: [],
      numItems: 0,
      numPages: 0,
    },
    { studios: [studio._id] }
  );

  /*  usePaginatedList({
    fetch: fetchScenes,
    initialPage: 0,
    querySettings: [],
  }); */

  useEffect(() => {
    fetchScenes().catch(() => {});
  }, []);

  return (
    <PageWrapper title={studio.name}>
      <AutoLayout style={{ width: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <AutoLayout style={{ maxWidth: 300, width: "100%", overflow: "hidden" }}>
            <img width="100%" src={thumbnailUrl(studio.thumbnail?._id)} alt="Studio Logo" />
          </AutoLayout>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {!!studio.parent && (
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              Part of{" "}
              <Link href={`/studio/${studio.parent._id}`} passHref>
                <a>
                  <img
                    width="120"
                    src={thumbnailUrl(studio.parent.thumbnail?._id)}
                    alt="Parent Studio Logo"
                  />
                </a>
              </Link>
            </div>
          )}
        </div>
        {!!studios.length && (
          <AutoLayout>
            <CardTitle>Studios</CardTitle>
            <ListWrapper loading={false} noResults={!studios.length}>
              {studios.map((studio) => (
                <StudioCard
                  key={studio._id}
                  onFav={(value) => {
                    editStudio(studio._id, (studio) => {
                      studio.favorite = value;
                      return studio;
                    });
                  }}
                  onBookmark={(value) => {
                    editStudio(studio._id, (studio) => {
                      studio.bookmark = !!value;
                      return studio;
                    });
                  }}
                  studio={studio}
                />
              ))}
            </ListWrapper>
          </AutoLayout>
        )}
        <AutoLayout>
          <CardTitle>Scenes</CardTitle>
          <ListWrapper loading={sceneLoader} noResults={!numScenes}>
            {scenes.map((scene) => (
              <SceneCard
                onFav={(value) => {
                  editScene(scene._id, (scene) => {
                    scene.favorite = value;
                    return scene;
                  });
                }}
                onBookmark={(value) => {
                  editScene(scene._id, (scene) => {
                    scene.bookmark = !!value;
                    return scene;
                  });
                }}
                onRate={(rating) => {
                  editScene(scene._id, (scene) => {
                    scene.rating = rating;
                    return scene;
                  });
                }}
                key={scene._id}
                scene={scene}
              />
            ))}
          </ListWrapper>
        </AutoLayout>
      </AutoLayout>
    </PageWrapper>
  );
}
