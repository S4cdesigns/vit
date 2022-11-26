import { ReactNode, useState } from "react";

import ExternalPlayerControls from "./ExternalPlayerControls";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props): JSX.Element {
  const [mobileSidebar, setMobileSidebar] = useState(false);

  function setSidebar(x: boolean) {
    setMobileSidebar(x);
  }

  return (
    <div className="layout">
      <Topbar setSidebar={setSidebar} />
      <Sidebar active={mobileSidebar} setSidebar={setSidebar} />
      <div className="content">{children}</div>
      <ExternalPlayerControls />
    </div>
  );
}
