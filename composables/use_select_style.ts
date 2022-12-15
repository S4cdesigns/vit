import { CSSProperties, useContext } from "react";

import { ThemeContext } from "../pages/_app";

export function useSelectStyle<T>() {
  const { theme } = useContext(ThemeContext);

  return {
    control: (provided: T) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#09090c" : "#fafafa",
      border: theme === "dark" ? "2px solid #09090c" : "2px solid #d0d0d0",
    }),
    menu: (provided: T) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#111111" : "#fafafa",
    }),
    container: (provided: T) => ({
      ...provided,
      maxWidth: 400,
    }),
    option: (provided: T) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#111111" : "#fafafa",
      color: theme === "dark" ? "#fafafa" : "#111111",
      cursor: "pointer",
      "&:hover": {
        filter: theme === "dark" ? "brightness(1.25)" : "brightness(0.8)",
      },
    }),
    multiValue: (provided: T) => {
      return {
        ...provided,
        backgroundColor: "#3142da",
        borderRadius: 4,
      };
    },
    multiValueLabel: (provided: T) => ({
      ...provided,
      color: "white",
    }),
  };
}
