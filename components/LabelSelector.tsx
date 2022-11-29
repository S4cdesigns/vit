import EditIcon from "mdi-react/EditIcon";
import { useContext } from "react";

import { ThemeContext } from "../pages/_app";
import ILabel from "../types/label";
import AutoLayout from "./AutoLayout";
import Paper from "./Paper";

type Props = {
  items: ILabel[];
  selected: string[];
  onChange?: (x: string[]) => void;
  editEnabled: boolean;
};

LabelSelector.defaultProps = {
  editEnabled: false,
};

export default function LabelSelector({ items, selected, onChange, editEnabled }: Props) {
  const { theme } = useContext(ThemeContext);

  function isSelected(labelId: string): boolean {
    return selected.includes(labelId);
  }

  return (
    <>
      {items.map((label) => (
        <Paper
          onClick={() => {
            if (isSelected(label._id)) {
              onChange?.(selected.filter((y) => y !== label._id));
            } else {
              onChange?.([...selected, label._id]);
            }
          }}
          className="hover"
          key={label._id}
          style={{
            borderRadius: "0%",
            borderTop: "none",
            borderRight: "none",
            borderBottom: "none",
            borderLeft: `4px solid ${label.color || "transparent"}`,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: isSelected(label._id)
              ? theme === "dark"
                ? "#303350"
                : "#ccddff"
              : theme === "dark"
              ? "#1C1C25"
              : "white",
          }}
        >
          <div style={{ opacity: 0.8, fontSize: 16, fontWeight: 500 }}>
            <AutoLayout layout="h">
              <div>{label.name}</div>
              <div>{editEnabled && <EditIcon className="hover" />}</div>
            </AutoLayout>
          </div>
        </Paper>
      ))}
    </>
  );
}
