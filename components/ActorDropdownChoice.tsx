import { MultiValue } from "react-select";
import AsyncSelect from "react-select/async";

import { fetchActors } from "../composables/use_actor_list";
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
  console.log('selected', selectedActors);
  const loadOptions = (inputValue: string, callback: (options: SelectableActor[]) => void) => {
    fetchActors(0, { query: inputValue })
      .then((result) => {
        console.log(result);
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
          // color: new Color(data.color || "#000000").isLight() ? "black" : "white",
          color: "white",
        }),
      }}
      filterOption={({ data: actor }, query) => actor.name.toLowerCase().includes(query)}
      isMulti
      defaultOptions={selectedActors}
      loadOptions={loadOptions}
      getOptionLabel={(actor) => actor.name}
      getOptionValue={(actor) => actor._id}
    />
  );
}
