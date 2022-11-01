import { CSSProperties, useState } from "react";
import YAML from "yaml";

import Button from "./Button";
import Description from "./Description";

type Props<T> = {
  value: T;
  style?: CSSProperties;
};

export default function Code<T>({ value, style }: Props<T>) {
  const [formatter, setFormatter] = useState<"json" | "yaml">("json");

  function formatText(value: T): string {
    if (formatter === "json") {
      return JSON.stringify(value, null, 2);
    }
    return YAML.stringify(value);
  }

  return (
    <div
      style={{
        backgroundColor: "#000000aa",
        padding: 8,
        borderRadius: 8,
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: 5, alignItems: "center", padding: 2, marginBottom: 10 }}>
        <Button
          style={{ backgroundColor: formatter === "json" ? "#3142da" : undefined }}
          onClick={() => setFormatter("json")}
        >
          JSON
        </Button>
        <Button
          style={{ backgroundColor: formatter === "yaml" ? "#3142da" : undefined }}
          onClick={() => setFormatter("yaml")}
        >
          YAML
        </Button>
      </div>
      <pre
        style={{
          margin: 0,
          fontFamily: "monospace sans-serif !important",
          opacity: "0.8",
          lineHeight: "150%",
        }}
      >
        {formatText(value)}
      </pre>
    </div>
  );
}
