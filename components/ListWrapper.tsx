import { ReactNode } from "react";

import ContentWrapper from "./ContentWrapper";
import ListContainer from "./ListContainer";
import Paper from "./Paper";

type Props = {
  children?: ReactNode;
  loading: boolean;
  noResults: boolean;
  size?: number;
};

export default function ListWrapper({ children, loading, noResults, size }: Props) {
  return (
    <ContentWrapper
      loading={loading}
      noResults={noResults}
      loader={
        <ListContainer>
          {[...new Array(16)].map((_, i) => (
            <Paper key={i} className="skeleton-card"></Paper>
          ))}
        </ListContainer>
      }
    >
      <ListContainer size={size}>{children}</ListContainer>
    </ContentWrapper>
  );
}
