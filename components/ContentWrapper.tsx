import { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  loader: ReactNode;
  loading: boolean;
  noResults: boolean;
};

export default function ContentWrapper({ loading, loader, children, noResults }: Props) {
  if (loading) {
    return <>{loader}</>;
  }
  if (noResults) {
    return <>No results</>;
  }
  return <>{children}</>;
}
