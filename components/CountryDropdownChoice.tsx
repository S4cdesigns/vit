import { useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

import { useSelectStyle } from "../composables/use_select_style";
import defaultCountries, { ICountry } from "../src/data/countries";

type SimpleCountry = Pick<ICountry, "name" | "alpha2" | "nationality" | "alias">;

type Props = {
  selected?: SimpleCountry | string;
  onChange?: (countr: SimpleCountry) => void;
  relevancy?: number;
};

export default function CountryDropdownChoice({
  selected,
  onChange,
  relevancy: minRelevancy,
}: Props) {
  const selectStyle = useSelectStyle();

  const selection = useMemo(() => {
    const country = selected as SimpleCountry;

    if (country?.name && country?.alpha2) {
      return country;
    }

    return defaultCountries.find((country) => country.alpha2 === selected);
  }, [selected]);

  const countries = useMemo(() => {
    return defaultCountries.filter(({ relevancy }) => relevancy > (minRelevancy ?? 1));
  }, [minRelevancy]);

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
      options={countries}
      getOptionLabel={(country) => country.name}
      getOptionValue={(country) => country.alpha2}
    />
  );
}
