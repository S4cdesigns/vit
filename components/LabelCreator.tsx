import { useTranslations } from "next-intl";
import { useState } from "react";

import { useWindow } from "../composables/use_window";
import ILabel from "../types/label";
import { graphqlQuery } from "../util/gql";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import Subheading from "./Subheading";
import Window from "./Window";

async function createLabel(name: string, color: string, aliases: string[]): Promise<ILabel> {
  const query = `
  mutation ($name: String!, $aliases: [String!]!, $color: String!) {
    addLabel(name: $name, aliases: $aliases, color: $color) {
      _id
    }
  }
 `;

  const result = await graphqlQuery<{ data: { addLabel: ILabel } }>(query, {
    name,
    aliases,
    color,
  });

  return result?.data?.addLabel;
}

type Props = {
  onCreate: (label: ILabel) => void;
};

export default function LabelCreator({ onCreate }: Props) {
  const t = useTranslations();
  const [loading, setLoader] = useState(false);
  const [name, setName] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [color, setColor] = useState("#000000");
  const { isOpen, close, open } = useWindow();

  return (
    <>
      <Button onClick={open} style={{ marginRight: 10 }}>
        + {t("actions.add")}
      </Button>
      <Window
        onClose={close}
        isOpen={isOpen}
        title={`Create label`}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  const newLabel = await createLabel(name, color, aliasInput.split("\n"));
                  onCreate(newLabel);
                  close();
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
            autoFocus
            style={{ width: "100%" }}
            value={name}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setName(event.currentTarget.value);
            }}
            placeholder="Enter a label name"
            type="text"
          />
        </div>

        <AutoLayout gap={5} layout="v">
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
            <Subheading>Color</Subheading>
            <input
              type="color"
              value={color}
              onChange={(event) => setColor(event.currentTarget.value)}
            />
          </div>
        </AutoLayout>
      </Window>
    </>
  );
}
