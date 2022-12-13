import HeartIcon from "mdi-react/HeartIcon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useSafeMode } from "../../composables/use_safe_mode";
import { IActor } from "../../types/actor";
import { graphqlQuery } from "../../util/gql";
import ActorGridItem from "../ActorGridItem";
import Button from "../Button";
import Text from "../Text";
import WidgetCard from "./WidgetCard";

async function getActors(skip = 0): Promise<{ actors: IActor[] }> {
  const query = `
  query($skip: Int) {
    topActors(skip: $skip, take: 4) {
      _id
      name
      thumbnail {
        _id
      }
      favorite
      bookmark
    }
  }
`;

  const { topActors } = await graphqlQuery<{
    topActors: IActor[];
  }>(query, {
    skip,
  });

  return {
    actors: topActors,
  };
}

export default function FavoritesCard() {
  const t = useTranslations();

  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState<IActor[]>([]);
  const [done, setDone] = useState(false);

  async function nextPage() {
    const { actors } = await getActors(skip);
    setSkip(skip + 4);
    setItems((prev) => [...prev, ...actors]);
    if (!actors.length) {
      setDone(true);
    }
  }

  useEffect(() => {
    nextPage().catch(() => {});
  }, []);

  function content() {
    if (items.length) {
      return items.map((actor) => (
        <ActorGridItem
          id={actor._id}
          key={actor._id}
          favorite={actor.favorite}
          name={actor.name}
          thumbnailId={actor.thumbnail?._id}
        />
      ));
    }
    return <Text>No actors (yet)!</Text>;
  }

  return (
    <WidgetCard icon={<HeartIcon />} title={t("yourFavorites")}>
      <div
        className="list-container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridGap: 4,
        }}
      >
        {content()}
      </div>
      {items.length > 0 && !done && (
        <Button style={{ marginTop: 2 }} onClick={nextPage}>
          {t("showMore")}
        </Button>
      )}
    </WidgetCard>
  );
}
