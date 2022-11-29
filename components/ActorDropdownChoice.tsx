import { MultiValue } from "react-select";
import AsyncSelect from "react-select/async";

import IActor from "../types/label";
import { graphqlQuery } from "../util/gql";

export type SelectableActor = Pick<IActor, "_id" | "name">;

type Props = {
  selectedActors?: readonly SelectableActor[];
  onChange: (value: SelectableActor[]) => void;
};

const defaultProps = {
  selectedLabels: [],
};

async function autocompleteActors(query: string): Promise<{ _id: string; name: string }[]> {
  const q = `
  query($query: ActorAutocompleteQuery) {
    autocompleteActors(query: $query) {
        items {
          _id
          name
        }
     }
  }
`;

  const { autocompleteActors } = await graphqlQuery<{
    autocompleteActors: { items: { _id: string; name: string }[] };
  }>(q, {
    query: { term: query },
  });

  return autocompleteActors.items;
}

export default function ActorDropdownChoice({ selectedActors, onChange }: Props) {
  const loadOptions = async (
    inputValue: string,
    callback: (options: SelectableActor[]) => void
  ) => {
    const result = await autocompleteActors(inputValue);
    callback(result);
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
