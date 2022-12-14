import Color from "color";
import Select, { MultiValue } from "react-select";

import useLabelList from "../composables/use_label_list";
import { useSelectStyle } from "../composables/use_select_style";
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
  const selectStyle = useSelectStyle();

  return (
    <Select
      value={selectedLabels}
      onChange={(newValue: MultiValue<SelectableLabel>) => {
        onChange(newValue.map((v) => v));
      }}
      closeMenuOnSelect={false}
      isClearable
      styles={selectStyle}
      filterOption={({ data: label }, query) => label.name.toLowerCase().includes(query)}
      isMulti
      options={labels}
      getOptionLabel={(label) => label.name}
      getOptionValue={(label) => label._id}
    />
  );
}
