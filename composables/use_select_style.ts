import { CSSProperties, useContext } from "react";

import { ThemeContext } from "../pages/_app";

export function useSelectStyle() {
  const { theme } = useContext(ThemeContext);

  return {
    control: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#09090c" : "#fafafa",
      border: theme === "dark" ? "2px solid #09090c" : "2px solid #d0d0d0",
    }),
    menu: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#111111" : "#fafafa",
    }),
    container: (provided: CSSProperties) => ({
      ...provided,
      maxWidth: 400,
    }),
    option: (provided: CSSProperties) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#111111" : "#fafafa",
      color: theme === "dark" ? "#fafafa" : "#111111",
      cursor: "pointer",
      "&:hover": {
        filter: theme === "dark" ? "brightness(1.25)" : "brightness(0.8)",
      },
    }),
    multiValue: (provided: CSSProperties) => {
      return {
        ...provided,
        backgroundColor: "#3142da",
        borderRadius: 4,
      };
    },
    multiValueLabel: (provided: CSSProperties) => ({
      ...provided,
      color: "white",
    }),
  };
}
