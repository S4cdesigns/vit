import { ReactNode } from "react";

import ListContainer from "./ListContainer";
import Paper from "./Paper";

type Props = {
  children?: ReactNode;
  loading: boolean;
  noResults: boolean;
  size?: number;
};

export default function ListWrapper({ children, loading, noResults, size }: Props) {
  if (loading) {
    return (
      <ListContainer size={size}>
        {[...new Array(16)].map((_, i) => (
          <Paper key={i} className="skeleton-card"></Paper>
        ))}
      </ListContainer>
    );
  }
  if (noResults) {
    return <>No results</>;
  }
  return <ListContainer size={size}>{children}</ListContainer>;
}
