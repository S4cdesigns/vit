import Color from "color";
import AddMarkerIcon from "mdi-react/EditIcon";
import { useState } from "react";
import { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import { useWindow } from "../composables/use_window";
import ILabel from "../types/label";
import { graphqlQuery } from "../util/gql";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import Subheading from "./Subheading";
import Window from "./Window";

async function editLabel(id: string, name: string, color?: string, aliases?: string[]) {
  const query = `
  mutation ($ids: [String!]!, $opts: LabelUpdateOpts!) {
    updateLabels(ids: $ids, opts: $opts) {
      _id
    }
  }
 `;

  await graphqlQuery(query, {
    ids: [id],
    opts: { name, color, aliases },
  });
}

type Props = {
  onEdit: () => void;
  label: ILabel;
};

export default function LabelEditor({ onEdit, label }: Props) {
  const [loading, setLoader] = useState(false);
  const [name, setName] = useState(label.name);
  const [aliasInput, setAliasInput] = useState(
    label.aliases.map((alias) => ({ value: alias, label: alias }))
  );

  const [color, setColor] = useState(label.color);
  const { isOpen, close, open } = useWindow();

  return (
    <>
      <AddMarkerIcon
        className="hover"
        size={24}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
      />
      <Window
        onClose={close}
        isOpen={isOpen}
        title={`Edit label ${label.name}`}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  await editLabel(
                    label._id,
                    name,
                    color,
                    aliasInput.map((opt) => opt.value)
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
            <CreatableSelect
              styles={{
                container: (baseStyles) => ({
                  ...baseStyles,
                  maxWidth: 400,
                }),
                option: (provided) => ({
                  ...provided,
                  color: "black",
                }),
                multiValue: (styles, { data }) => {
                  return {
                    ...styles,
                    backgroundColor: "black",
                    borderRadius: 4,
                  };
                },
                multiValueLabel: (styles, { data }) => ({
                  ...styles,
                  color: "white",
                }),
              }}
              isMulti
              value={aliasInput}
              onChange={(options: MultiValue<{ value: string; label: string }>) => {
                setAliasInput(
                  options.map((option) => ({ value: option.value, label: option.label }))
                );
              }}
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
