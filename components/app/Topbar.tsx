import MenuIcon from "mdi-react/HamburgerMenuIcon";
import PatreonIcon from "mdi-react/PatreonIcon";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useState } from "react";

import Spacer from "../Spacer";

type Props = {
  setSidebar: (x: boolean) => void;
};

export default function Topbar({ setSidebar }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const [searchText, setSearchText] = useState("");

  return (
    <div className="topbar">
      <div style={{ width: "100%", display: "flex", alignItems: "center", padding: 12, gap: 10 }}>
        <MenuIcon onClick={() => setSidebar(true)} className="mobile-sidebar-toggle" />
        <img
          onClick={() => router.push("/")}
          className="hover"
          width={36}
          height={36}
          src="/assets/favicon.png"
        />
        <a
          href="https://www.patreon.com/pornvault"
          target="_blank"
          style={{ display: "flex", alignItems: "center", opacity: 0.66 }}
        >
          <PatreonIcon size={20} />
        </a>
        <Spacer />
        <input
          type="text"
          placeholder={t("findContent")}
          value={searchText}
          onChange={(ev) => setSearchText(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              router.push(`/search?q=${searchText}`).catch(() => {});
            }
          }}
        />
      </div>
    </div>
  );
}
