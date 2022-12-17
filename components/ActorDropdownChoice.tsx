import { MultiValue } from "react-select";
import AsyncSelect from "react-select/async";

import { fetchActors } from "../composables/use_actor_list";
import { useSelectStyle } from "../composables/use_select_style";
import IActor from "../types/label";

export type SelectableActor = Pick<IActor, "_id" | "name">;

type Props = {
  selectedActors?: readonly SelectableActor[];
  onChange: (value: SelectableActor[]) => void;
};

const defaultProps = {
  selectedLabels: [],
};

export default function ActorDropdownChoice({ selectedActors, onChange }: Props) {
  const selectStyle = useSelectStyle();
  const loadOptions = (inputValue: string, callback: (options: SelectableActor[]) => void) => {
    fetchActors(0, { query: inputValue })
      .then((result) => {
        callback(result.items);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <AsyncSelect
      value={selectedActors}
      onChange={(newValue: MultiValue<SelectableActor>) => {
        onChange(newValue.map((v) => v));
      }}
      closeMenuOnSelect={false}
      isClearable
      styles={selectStyle}
      filterOption={({ data: actor }, query) => actor.name.toLowerCase().includes(query)}
      isMulti
      defaultOptions={selectedActors}
      loadOptions={loadOptions}
      getOptionLabel={(actor) => actor.name}
      getOptionValue={(actor) => actor._id}
    />
  );
}
