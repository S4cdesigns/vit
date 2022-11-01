import axios from "axios";
import { useState } from "react";

import { useWindow } from "../composables/use_window";
import { gqlIp } from "../util/ip";
import Button from "./Button";
import Subheading from "./Subheading";
import Window from "./Window";

async function createActor(name: string, aliases: string[]) {
  await axios.post(
    gqlIp(),
    {
      query: `
mutation ($name: String!, $aliases: [String!]!) {
  addActor(name: $name, aliases: $aliases) {
    _id
  }
}
      `,
      variables: {
        name,
        aliases,
      },
    },
    {
      headers: {
        "x-pass": "xxx",
      },
    }
  );
}

type Props = {
  onCreate: () => void;
};

export default function ActorCreator({ onCreate }: Props) {
  const { isOpen, close, open } = useWindow();

  const [name, setName] = useState("");
  const [aliases, setAliases] = useState("");

  const [loader, setLoader] = useState(false);

  return (
    <>
      <Button onClick={open} style={{ marginRight: 10 }}>
        + Add actor
      </Button>
      <Window
        onClose={close}
        isOpen={isOpen}
        title="Add actor"
        actions={
          <>
            <div style={{ flexGrow: 1 }}></div>
            <Button
              loading={loader}
              onClick={async () => {
                try {
                  setLoader(true);
                  await createActor(
                    name,
                    aliases.split("\n").map((x) => x.trim())
                  );
                  onCreate();
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
