import { useTranslations } from "next-intl";
import { useState } from "react";

import { useWindow } from "../composables/use_window";
import Button from "./Button";
import { createMovie } from "./MovieCreator";
import Subheading from "./Subheading";
import Window from "./Window";

type Props = {
  onCreate: () => void;
};

export default function MovieBulkCreator({ onCreate }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();

  const [input, setInput] = useState("");

  const [loading, setLoader] = useState(false);

  const movieNames = input.split("\n").filter((x) => !!x.trim());

  return (
    <>
      <Button onClick={open} style={{ marginRight: 10 }}>
        + {t("actions.addMany")}
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

                  for (const name of movieNames) {
                    await createMovie(name, []);
                  }
                  onCreate();
                  close();
                  setInput("");
                } catch (error) {}
                setLoader(false);
              }}
              style={{ color: "white", background: "#3142da" }}
            >
              Create {movieNames.length}
            </Button>
            <Button onClick={close}>Close</Button>
          </>
        }
      >
        <div>
          <Subheading>Movies</Subheading>
          <textarea
            autoFocus
            style={{ width: "100%" }}
            value={input}
            onChange={(ev) => setInput(ev.target.value)}
            placeholder="1 per line"
            rows={10}
          />
        </div>
      </Window>
    </>
  );
}
