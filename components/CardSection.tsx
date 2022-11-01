import { ReactNode } from "react";

import Subheading from "./Subheading";

type Props = {
  title: ReactNode;
  children: ReactNode;
};

export default function CardSection({ title, children }: Props) {
  return (
    <div>
      <Subheading>{title}</Subheading>
      <div>{children}</div>
    </div>
  );
}
