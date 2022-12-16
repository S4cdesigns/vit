import { useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

import { useSelectStyle } from "../composables/use_select_style";
import defaultCountries, { ICountry } from "../src/data/countries";

type SimpleCountry = Pick<ICountry, "name" | "alpha2" | "nationality" | "alias">;

type Props = {
  selected?: SimpleCountry | string;
  onChange?: (countr: SimpleCountry) => void;
};

export default function CountryDropdownChoice({ selected, onChange }: Props) {
  const selectStyle = useSelectStyle();

  const selection = useMemo(() => {
    const country = selected as SimpleCountry;

    if (country?.name && country?.alpha2) {
      return country;
    }

    return defaultCountries.find((country) => country.alpha2 === selected);
  }, [selected]);

  return (
    <Select<SimpleCountry>
      value={selection}
      onChange={(newValue: SingleValue<SimpleCountry>) => {
        if (newValue) {
          onChange?.(newValue);
        }
      }}
      closeMenuOnSelect
      isClearable
      styles={selectStyle}
      isMulti={false}
      options={defaultCountries}
      getOptionLabel={(country) => country.name}
      getOptionValue={(country) => country.alpha2}
    />
  );
}
