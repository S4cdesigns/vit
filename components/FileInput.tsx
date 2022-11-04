import { useMemo } from "react";
import { randomString } from "../src/utils/hash";
import Button from "./Button";

type Props = {
  onChange?: (files: File[]) => void;
  accept?: string[];
  multiple?: boolean;
};

export default function FileInput({ onChange, accept, multiple }: Props) {
  const id = useMemo(randomString, []);

  return (
    <>
      <Button onClick={() => document.getElementById(id)?.click()}>Select files</Button>
      <input
        id={id}
        multiple={multiple ?? false}
        type="file"
        accept={accept?.join(", ")}
        onChange={(ev) => {
          ev.target.files && onChange?.(Array.from(ev.target.files));
        }}
        style={{ display: "none" }}
      />
    </>
  );
}
