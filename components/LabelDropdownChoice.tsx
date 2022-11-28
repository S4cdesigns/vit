import Color from "color";
import Select, { MultiValue } from "react-select";

import useLabelList from "../composables/use_label_list";
import ILabel from "../types/label";

export type SelectableLabel = Pick<ILabel, "_id" | "name" | "color">;

type Props = {
  selectedLabels?: readonly SelectableLabel[];
  onChange: (value: SelectableLabel[]) => void;
};

const defaultProps = {
  selectedLabels: [],
};

export default function LabelDropdownChoice({ selectedLabels, onChange }: Props) {
  const { labels } = useLabelList();

  return (
    <Select
      value={selectedLabels}
      onChange={(newValue: MultiValue<SelectableLabel>) => {
        onChange(newValue.map((v) => v));
      }}
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
      filterOption={({ data: label }, query) => label.name.toLowerCase().includes(query)}
      isMulti
      options={labels}
      getOptionLabel={(label) => label.name}
      getOptionValue={(label) => label._id}
    />
  );
}
