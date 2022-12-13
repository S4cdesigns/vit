import { useTranslations } from "next-intl";
import { useState } from "react";
import Select from "react-select";

import useLabelList from "../composables/use_label_list";
import { useSelectStyle } from "../composables/use_select_style";
import { useWindow } from "../composables/use_window";
import ILabel from "../types/label";
import { graphqlQuery } from "../util/gql";
import Button from "./Button";
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

  await graphqlQuery(query, {
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
  const selectStyle = useSelectStyle();

  const [name, setName] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<readonly ILabel[]>([]);

  const [loading, setLoader] = useState(false);
  const { labels } = useLabelList();

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
                  await createActor(
                    name,
                    aliasInput.split("\n"),
                    selectedLabels.map(({ _id }) => _id)
                  );
                  onCreate();
                  close();
                  setName("");
                  setAliasInput("");
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
          <Subheading>Actor name</Subheading>
          <input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter an actor name"
            type="text"
          />
        </div>
        <div>
          <Subheading>Aliases</Subheading>
          <textarea
            value={aliasInput}
            onChange={(ev) => setAliasInput(ev.target.value)}
            placeholder="1 per line"
          />
        </div>
        <div>
          <Subheading>Labels</Subheading>
          <Select
            value={selectedLabels}
            onChange={setSelectedLabels}
            closeMenuOnSelect={false}
            isClearable
            styles={selectStyle}
            filterOption={({ data: label }, query) =>
              label.name.toLowerCase().includes(query) ||
              label.aliases.some((alias) => alias.toLowerCase().includes(query))
            }
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
