/* eslint-disable @typescript-eslint/no-unsafe-return */
import EditIcon from "mdi-react/PencilIcon";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import { useWindow } from "../composables/use_window";
import { IActor } from "../types/actor";
import { graphqlQuery } from "../util/gql";
import Button from "./Button";
import ExternalLinksEditor from "./ExternalLinksEditor";
import Subheading from "./Subheading";
import Window from "./Window";

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
  onEdit: () => void;
  actor: IActor;
};

export default function ActorEditor({ onEdit, actor }: Props) {
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
      <EditIcon onClick={open} className="hover" />
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
                  onEdit();
                  close();
                  // setName("");
                  setAliasInput([]);
                  // setSelectedLabels([]);
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
        <ExternalLinksEditor
          externalLinks={externalLinks}
          updateLinkText={updateLinkText}
          updateLinkUrl={updateLinkUrl}
          addExternalLink={addExternalLink}
          removeLink={removeLink}
        />
      </Window>
    </>
  );
}
