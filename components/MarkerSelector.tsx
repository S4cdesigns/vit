import { useContext } from "react";

import { ThemeContext } from "../pages/_app";
import { IMarker } from "../types/marker";
import MarkerCard from "./MarkerCard";

type Props = {
  items: IMarker[];
  selected: string[];
  onChange?: (x: string[]) => void;
  editEnabled: boolean;
};

MarkerSelector.defaultProps = {
  editEnabled: false,
};

export default function MarkerSelector({ items, selected, onChange, editEnabled }: Props) {
  const { theme } = useContext(ThemeContext);

  function isSelected(labelId: string): boolean {
    return selected.includes(labelId);
  }

  return (
    <>
      {items.map((marker) => (
        <MarkerCard marker={marker} />
      ))}
    </>
  );
}
