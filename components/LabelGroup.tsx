import ChevronDownIcon from "mdi-react/ChevronDownIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";
import { useState } from "react";

import Label from "./Label";

type Props = {
  labels: { _id: string; name: string; color?: string }[];
  limit?: number;
  onAdd?: () => void;
};

export default function LabelGroup({ labels, limit, onAdd }: Props): JSX.Element {
  const max = limit || 5;

  const [expanded, setExpanded] = useState(false);

  const slice = expanded ? labels : labels.slice(0, max);

  return (
    <div>
      {slice.map((label) => (
        <Label key={label._id} color={label.color}>
          {label.name}
        </Label>
      ))}
      {onAdd && (
        <Label className="hover" onClick={onAdd}>
          + Add
        </Label>
      )}
      <div style={{ textAlign: "center" }}>
        {max < labels.length && (
          <div
            style={{
              cursor: "pointer",
              marginTop: 5,
              fontSize: 13,
              fontWeight: "bold",
              opacity: 0.75,
            }}
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </div>
        )}
      </div>
    </div>
  );
}
