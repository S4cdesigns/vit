import { useTranslations } from "next-intl";
import { useState } from "react";

import { useWindow } from "../composables/use_window";
import { graphqlQuery } from "../util/gql";
import Button from "./Button";
import InputError from "./InputError";
import LabelDropdownChoice, { SelectableLabel } from "./LabelDropdownChoice";
import Subheading from "./Subheading";
import Window from "./Window";

async function createActor(name: string, aliases: string[], labels: string[]) {
  const query = `
  mutation ($name: String!, $aliases: [String!]!, $labels: [String!]!) {
    addActor(name: $name, aliases: $aliases, labels: $labels) {
      _id
    }
  }
        `;

  return await graphqlQuery(query, {
    name,
    aliases,
    labels,
  });
}

type Props = {
  onCreate: () => void;
};

export default function ActorCreator({ onCreate }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();

  const [error, setError] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<readonly SelectableLabel[]>([]);

  const [loading, setLoader] = useState(false);

  const reset = () => {
    setName("");
    setAliasInput("");
    setSelectedLabels([]);
    setError(undefined);
  };

  const doClose = () => {
    reset();
    close();
  };

  return (
    <>
      <Button onClick={open} style={{ marginRight: 10 }}>
        + {t("actions.add")}
      </Button>
      <Window
        onClose={doClose}
        isOpen={isOpen}
        title={t("actions.add")}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  await createActor(
                    name,
                    aliasInput.split("\n"),
                    selectedLabels.map(({ _id }) => _id)
                  );

                  onCreate();
                  doClose();
                } catch (error) {
                  console.error(error);
                  if (error instanceof Error) {
                    setError(error.message);
                  } else {
                    setError("An error occurred");
                  }
                }
                setLoader(false);
              }}
              style={{ color: "white", background: "#3142da" }}
            >
              Create
            </Button>
            <Button onClick={doClose}>Close</Button>
          </>
        }
      >
        <div>
          <Subheading>Actor name</Subheading>
          <input
            style={{ width: "100%" }}
            autoFocus
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter an actor name"
            type="text"
          />
          {error && <InputError message={error} />}
        </div>
        <div>
          <Subheading>Aliases</Subheading>
          <textarea
            style={{ width: "100%" }}
            value={aliasInput}
            onChange={(ev) => setAliasInput(ev.target.value)}
            placeholder="1 per line"
          />
        </div>
        <div>
          <Subheading>Labels</Subheading>
          <LabelDropdownChoice onChange={setSelectedLabels} selectedLabels={selectedLabels} />
        </div>
      </Window>
    </>
  );
}
