/* eslint-disable @typescript-eslint/no-unsafe-return */
import Color from "color";
import DeleteIcon from "mdi-react/DeleteIcon";
import EditIcon from "mdi-react/PencilIcon";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import { useWindow } from "../composables/use_window";
import { IActor } from "../types/actor";
import { graphqlQuery } from "../util/gql";
import AutoLayout from "./AutoLayout";
import Button from "./Button";
import Spacer from "./Spacer";
import Subheading from "./Subheading";
import Window from "./Window";

// TODO: generic styles for selects?
const selectStyles = {
  container: (provided: any) => ({
    ...provided,
    maxWidth: 400,
  }),
  option: (provided: any) => ({
    ...provided,
    color: "black",
  }),
  multiValue: (styles: any, { data }: any) => {
    return {
      ...styles,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      backgroundColor: data.color || "black",
      borderRadius: 4,
    };
  },
  multiValueLabel: (styles: any, { data }: any) => ({
    ...styles,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    color: new Color(data.color || "#000000").isLight() ? "black" : "white",
  }),
};

async function editActor(
  id: string,
  name: string,
  aliases: string[],
  externalLinks: { url: string; text: string }[]
) {
  const query = `
  mutation ($ids: [String!]!, $opts: ActorUpdateOpts!) {
    updateActors(ids: $ids, opts: $opts) {
      _id
    }
  }
 `;

  await graphqlQuery(query, {
    ids: [id],
    opts: { name, aliases, externalLinks },
  });
}

type Props = {
  onCreate: () => void;
  actor: IActor;
};

export default function ActorEditor({ onCreate, actor }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();
  const [name, setName] = useState(actor.name);
  const [aliasInput, setAliasInput] = useState(
    actor.aliases.map((alias) => ({ value: alias, label: alias }))
  );
  const [externalLinks, setExternalLinks] = useState(actor.externalLinks);
  const [loading, setLoader] = useState(false);

  const updateLinkUrl = (idx: number, url: string): void => {
    const newLinks = externalLinks.map((link, index) => {
      if (index !== idx) {
        return link;
      }

      return { url, text: link.text };
    });
    setExternalLinks(newLinks);
  };

  const updateLinkText = (idx: number, text: string): void => {
    const newLinks = externalLinks.map((link, index) => {
      if (index !== idx) {
        return link;
      }

      return { url: link.url, text };
    });
    setExternalLinks(newLinks);
  };

  const addExternalLink = () => {
    setExternalLinks([...externalLinks, { url: "", text: "" }]);
  };

  const removeLink = (idx: number) => {
    setExternalLinks(externalLinks.filter((link, index) => idx !== index));
  };

  return (
    <>
      <EditIcon onClick={open} />
      <Window
        onClose={close}
        isOpen={isOpen}
        title={t("actions.edit")}
        actions={
          <>
            <Button
              loading={loading}
              onClick={async () => {
                try {
                  setLoader(true);
                  await editActor(
                    actor._id,
                    name,
                    aliasInput.map((alias) => alias.value),
                    externalLinks
                  );
                  onCreate();
                  close();
                  // setName("");
                  setAliasInput([]);
                  // setSelectedLabels([]);
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
            style={{ width: "100%" }}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Enter an actor name"
            type="text"
          />
        </div>
        <div>
          <Subheading>Aliases</Subheading>
          <CreatableSelect
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
          <Subheading>External Links</Subheading>
          <Button onClick={addExternalLink}>Add link</Button>
          {externalLinks.map((link, idx) => (
            <AutoLayout gap={10} layout="v">
              <div>
                <input
                  style={{ width: "100%" }}
                  value={link.url}
                  onChange={(ev) => updateLinkUrl(idx, ev.target.value)}
                  placeholder="Enter the URL"
                  type="url"
                />
              </div>
              <div>
                <input
                  style={{ width: "90%" }}
                  value={link.text}
                  onChange={(ev) => updateLinkText(idx, ev.target.value)}
                  placeholder="Enter the URLs text"
                  type="text"
                />
                <DeleteIcon
                  onClick={() => removeLink(idx)}
                  style={{ width: "10%", verticalAlign: "middle" }}
                />
              </div>
              <Spacer />
            </AutoLayout>
          ))}
        </div>
      </Window>
    </>
  );
}
