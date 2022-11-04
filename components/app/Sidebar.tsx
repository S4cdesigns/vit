import clsx from "clsx";
import ActorIcon from "mdi-react/AccountBoxIcon";
import StudioIcon from "mdi-react/CameraAltIcon";
import SettingsIcon from "mdi-react/CogIcon";
import ImageIcon from "mdi-react/ImageIcon";
import MarkerIcon from "mdi-react/SkipNextIcon";
import SceneIcon from "mdi-react/VideocamIcon";
import MovieIcon from "mdi-react/FilmstripBoxMultipleIcon";
import LabelsIcon from "mdi-react/LabelIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { ReactNode, useContext } from "react";

import { useVersion } from "../../composables/use_version";
import { ThemeContext } from "../../pages/_app";
import Button from "../Button";
import Paper from "../Paper";
import Flag from "../Flag";
import SidebarLink from "./SidebarLink";

const links: (
  | { divider: true }
  | { divider: false; text: string; icon: ReactNode; url: string }
)[] = [
  {
    text: "scene",
    icon: <SceneIcon />,
    url: "/scenes",
    divider: false,
  },
  {
    text: "actor",
    icon: <ActorIcon />,
    url: "/actors",
    divider: false,
  },
  {
    text: "movie",
    icon: <MovieIcon />,
    url: "/movies",
    divider: false,
  },
  {
    text: "studio",
    icon: <StudioIcon />,
    url: "/studios",
    divider: false,
  },
  {
    text: "image",
    icon: <ImageIcon />,
    url: "/images",
    divider: false,
  },
  {
    text: "marker",
    icon: <MarkerIcon />,
    url: "/markers",
    divider: false,
  },
  { divider: true },
  {
    text: "labels",
    icon: <LabelsIcon />,
    url: "/labels",
    divider: false,
  },
  {
    text: "settings",
    icon: <SettingsIcon />,
    url: "/settings",
    divider: false,
  },
];

const languages: [string, string, string][] = [
  ["English", "US", "en"],
  ["Deutsch", "DE", "de"],
  /*  ["Francais", "FR", "fr"], */
];

type Props = {
  active: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ active, toggleSidebar }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const { toggleTheme } = useContext(ThemeContext);
  const { version } = useVersion();

  function switchLocale(locale: string): void {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale, scroll: false }).catch(() => {});
  }

  const sidebarContent = (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          flexGrow: 1,
          overflowY: "scroll",
        }}
      >
        {links.map((link) => (
          <>
            {link.divider ? (
              <hr style={{ width: "100%", opacity: 0.33 }} />
            ) : (
              <SidebarLink icon={link.icon} url={link.url}>
                {t(link.text, { numItems: 2 })}
              </SidebarLink>
            )}
          </>
        ))}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div style={{ gap: 8, display: "flex", alignItems: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={toggleTheme}>Toggle theme</Button>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ gap: 8, display: "flex", justifyContent: "center" }}>
            {languages.map(([name, code, locale]) => (
              <Flag
                className="hover"
                onClick={() => switchLocale(locale)}
                name={name}
                code={code}
                size={24}
                key={locale}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
            fontWeight: "bold",
            opacity: 0.75,
          }}
        >
          v{version}
        </div>
      </div>
    </>
  );

  return (
    <>
      {active && <div className="mobile-sidebar-darken" style={{}} onClick={toggleSidebar}></div>}
      <Paper className={clsx({ active }, "mobile-sidebar")}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 4,
          }}
        >
          {sidebarContent}
        </div>
      </Paper>
      <div className="sidebar">
        <div className="inner">{sidebarContent}</div>
      </div>
    </>
  );
}
