import AddIcon from "mdi-react/AddIcon";
import ChevronDownIcon from "mdi-react/ChevronDownIcon";
import ChevronUpIcon from "mdi-react/ChevronUpIcon";
import DeleteIcon from "mdi-react/DeleteIcon";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import useLabelList from "../composables/use_label_list";
import Button from "./Button";
import IconButtonMenu from "./IconButtonMenu";
import Label from "./Label";
import LabelSelector from "./LabelSelector";

type Props = {
  labels: { _id: string; name: string; color?: string }[];
  limit?: number;
  onAdd?: (labels: string[]) => void;
  onDelete?: (label: string) => void;
};

export default function LabelGroup({ labels, limit, onAdd, onDelete }: Props): JSX.Element {
  const max = limit || 5;
  const t = useTranslations();

  const { labels: labelList, loading: labelLoader } = useLabelList();

  const [expanded, setExpanded] = useState(false);
  const [labelQuery, setLabelQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>(labels.map((label) => label._id));

  const [closeDropdown, setCloseDropdown] = useState<boolean>(false);

  useEffect(() => {
    if (!closeDropdown) {
      return;
    }

    setCloseDropdown(false);
  }, [closeDropdown]);

  const slice = expanded ? labels : labels.slice(0, max);

  const AddLabel = () => <Label color="#ffffff">Add + </Label>;

  return (
    <div>
      {slice.map((label) => (
        <Label
          key={label._id}
          color={label.color}
          onDelete={onDelete ? () => onDelete && onDelete(label._id) : undefined}
        >
          {label.name}
        </Label>
      ))}
      {onAdd && (
        <div style={{ display: "inline-block" }}>
          <IconButtonMenu
            counter={0}
            value={false}
            activeIcon={AddLabel}
            inactiveIcon={AddLabel}
            isLoading={labelLoader}
            disabled={false}
            closeDropdown={closeDropdown}
          >
            <input
              type="text"
              autoFocus
              style={{ width: "100%", marginBottom: 10 }}
              placeholder={t("findLabels")}
              value={labelQuery}
              onChange={(ev) => setLabelQuery(ev.target.value)}
            />
            <Button
              onClick={() => {
                onAdd(selectedLabels);
                setSelectedLabels([]);
                setLabelQuery("");
                setCloseDropdown(true);
              }}
            >
              Add selected
            </Button>
            <LabelSelector
              selected={selectedLabels}
              items={labelList.filter((label) => {
                if (labels.some((existing) => existing._id === label._id)) {
                  return false;
                }

                return (
                  label.name.toLowerCase().includes(labelQuery.toLowerCase()) ||
                  label.aliases.some((alias) =>
                    alias.toLowerCase().includes(labelQuery.toLowerCase())
                  )
                );
              })}
              onChange={setSelectedLabels}
            />
          </IconButtonMenu>
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        {max < labels.length && (
          <div
            style={{
              cursor: "pointer",
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
