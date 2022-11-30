import { useContext } from "react";

import { ThemeContext } from "../pages/_app";
import ILabel from "../types/label";
import AutoLayout from "./AutoLayout";
import LabelEditor from "./LabelEditor";
import Paper from "./Paper";

type Props = {
  items: ILabel[];
  selected: string[];
  onChange?: (x: string[]) => void;
  onEdit?: (updatedLabel: ILabel) => void;
  editEnabled: boolean;
  filter: string;
};

LabelSelector.defaultProps = {
  editEnabled: false,
  onEdit: undefined,
  filter: undefined,
};

export default function LabelSelector({
  items,
  selected,
  onChange,
  editEnabled,
  onEdit,
  filter,
}: Props) {
  const { theme } = useContext(ThemeContext);
  const normalizedFilter = filter?.toLowerCase().trim();

  function isSelected(labelId: string): boolean {
    return selected.includes(labelId);
  }

  const filterLabel = (label: ILabel, index: number) => {
    if (normalizedFilter.length === 0) {
      return true;
    }

    const name = label.name?.toLowerCase();

    if (!name) {
      return true;
    }

    return name.indexOf(normalizedFilter) >= 0;
  };

  return (
    <>
      {items.filter(filterLabel).map((label) => (
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
          <div style={{ opacity: 0.8, fontSize: 16, fontWeight: 500, width: "100%" }}>
            <AutoLayout layout="h">
              <div
                style={{
                  flex: 6,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                {label.name}
              </div>
              <div style={{ flex: 1 }}>
                {editEnabled && (
                  <LabelEditor label={label} onEdit={() => onEdit && onEdit(label)} />
                )}
              </div>
            </AutoLayout>
          </div>
        </Paper>
      ))}
    </>
  );
}
