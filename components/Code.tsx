import { CSSProperties, useContext, useState } from "react";
import YAML from "yaml";
import { ThemeContext } from "../pages/_app";

import Button from "./Button";

type Props<T> = {
  value: T;
  style?: CSSProperties;
};

export default function Code<T>({ value, style }: Props<T>) {
  const { theme } = useContext(ThemeContext);
  const [formatter, setFormatter] = useState<"json" | "yaml">("json");

  function formatText(value: T): string {
    if (formatter === "json") {
      return JSON.stringify(value, null, 2);
    }
    return YAML.stringify(value);
  }

  const selectedColor = theme === "dark" ? "#3142da" : "#2255ff";

  const selectedTextColor = theme === "dark" ? "#fafafa" : "#fafafa";
  const unselectedTextColor = theme === "dark" ? "#fafafa" : "#202020";

  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#000000" : "#f0f0f0",
        color: theme === "dark" ? "#fafafa" : "#101010",
        padding: 8,
        borderRadius: 8,
        overflowY: "hidden",
        ...style,
      }}
    >
      <div style={{ display: "flex", gap: 5, alignItems: "center", padding: 2, marginBottom: 10 }}>
        <Button
          style={{
            color: formatter === "json" ? selectedTextColor : unselectedTextColor,
            backgroundColor: formatter === "json" ? selectedColor : undefined,
          }}
          onClick={() => setFormatter("json")}
        >
          JSON
        </Button>
        <Button
          style={{
            color: formatter === "yaml" ? selectedTextColor : unselectedTextColor,
            backgroundColor: formatter === "yaml" ? selectedColor : undefined,
          }}
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
          overflowY: "scroll",
          maxHeight: 300,
        }}
      >
        {formatText(value)}
      </pre>
    </div>
  );
}
