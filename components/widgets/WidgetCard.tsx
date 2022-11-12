import type { ReactNode } from "react";
import AutoLayout from "../AutoLayout";

import Card from "../Card";

type Props = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
};

export default function WidgetCard({ children, icon, title }: Props) {
  return (
    <Card>
      <AutoLayout>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon} <span style={{ fontSize: 18 }}>{title}</span>
        </div>
        <AutoLayout gap={10}>{children}</AutoLayout>
      </AutoLayout>
    </Card>
  );
}
