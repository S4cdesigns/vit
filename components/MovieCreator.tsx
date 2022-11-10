import { useTranslations } from "next-intl";
import { useState } from "react";

import { useWindow } from "../composables/use_window";
import { graphqlQuery } from "../util/gql";
import Button from "./Button";
import Subheading from "./Subheading";
import Window from "./Window";

export async function createMovie(name: string, sceneIds: string[]) {
  const query = `
  mutation ($name: String!, $scenes: [String!]!) {
    addMovie(name: $name, scenes: $scenes) {
      _id
    }
  }
        `;

  await graphqlQuery(query, {
    name,
    scenes: sceneIds,
  });
}

type Props = {
  onCreate: () => void;
};

export default function MovieCreator({ onCreate }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();

  const [name, setName] = useState("");

  const [loading, setLoader] = useState(false);

  return (
    <>
      <Button onClick={open} style={{ marginRight: 10 }}>
        + {t("actions.add")}
      </Button>
      <Window
        onClose={close}
        isOpen={isOpen}
        title={t("actions.add")}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  await createMovie(name, []);
                  onCreate();
                  close();
                  setName("");
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
          <Subheading>Movie name</Subheading>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter a movie name"
            type="text"
          />
        </div>
      </Window>
    </>
  );
}
