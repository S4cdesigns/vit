import Color from "color";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Select from "react-select";

import useLabelList from "../composables/use_label_list";
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

  const [name, setName] = useState("");
  const [aliases, setAliases] = useState("");
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
                    aliases.split("\n").map((x) => x.trim()),
                    selectedLabels.map(({ _id }) => _id)
                  );
                  onCreate();
                  close();
                  setName("");
                  setAliases("");
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
            placeholder="e.g. Sybil Kailena"
            type="text"
          />
        </div>
        <div>
          <Subheading>Aliases</Subheading>
          <textarea
            value={aliases}
            onChange={(ev) => setAliases(ev.target.value)}
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
            styles={{
              container: (provided) => ({
                ...provided,
                maxWidth: 400,
              }),
              option: (provided) => ({
                ...provided,
                color: "black",
              }),
              multiValue: (styles, { data }) => {
                return {
                  ...styles,
                  backgroundColor: data.color || "black",
                  borderRadius: 4,
                };
              },
              multiValueLabel: (styles, { data }) => ({
                ...styles,
                color: new Color(data.color || "#000000").isLight() ? "black" : "white",
              }),
            }}
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
        {/*  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="hover">
              {true ? (
                <HeartIcon className="hover" style={{ fontSize: 28, color: "#ff3355" }} />
              ) : (
                <HeartBorderIcon className="hover" style={{ fontSize: 28 }} />
              )}
            </div>
            <div className="hover">
              {true ? (
                <BookmarkIcon className="hover" style={{ fontSize: 28 }} />
              ) : (
                <BookmarkBorderIcon className="hover" style={{ fontSize: 28 }} />
              )}
            </div>
          </div> */}
        {/*   <div style={{ fontSize: 14, opacity: 0.66, marginBottom: 3 }}>Labels</div> */}
        {/*    <LabelSelector selected={[]} items={labelList} /> */}
      </Window>
    </>
  );
}
