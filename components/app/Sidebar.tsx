import clsx from "clsx";
import ActorIcon from "mdi-react/AccountBoxIcon";
import StudioIcon from "mdi-react/CameraAltIcon";
import SettingsIcon from "mdi-react/CogIcon";
import MovieIcon from "mdi-react/FilmstripBoxMultipleIcon";
import UnsafeModeIcon from "mdi-react/FireIcon";
import SafeModeIcon from "mdi-react/FlowerIcon";
import ImageIcon from "mdi-react/ImageIcon";
import LabelsIcon from "mdi-react/LabelIcon";
import MarkerIcon from "mdi-react/PlaylistStarIcon";
import SceneIcon from "mdi-react/VideocamIcon";
import DarkThemeIcon from "mdi-react/WeatherNightIcon";
import LightThemeIcon from "mdi-react/WhiteBalanceSunnyIcon";
import ViewHistoryIcon from "mdi-react/HistoryIcon";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { Fragment, ReactNode, useContext } from "react";

import { useVersion } from "../../composables/use_version";
import { SafeModeContext, ThemeContext } from "../../pages/_app";
import Flag from "../Flag";
import Paper from "../Paper";
import SidebarLink from "./SidebarLink";

const links: (
  | { divider: true }
  | { divider: false; text: string; icon: ReactNode; url: string }
)[] = [
  {
    text: "heading.scenes",
    icon: <SceneIcon />,
    url: "/scenes",
    divider: false,
  },
  {
    text: "heading.actors",
    icon: <ActorIcon />,
    url: "/actors",
    divider: false,
  },
  {
    text: "heading.movies",
    icon: <MovieIcon />,
    url: "/movies",
    divider: false,
  },
  {
    text: "heading.studios",
    icon: <StudioIcon />,
    url: "/studios",
    divider: false,
  },
  {
    text: "heading.images",
    icon: <ImageIcon />,
    url: "/images",
    divider: false,
  },
  {
    text: "heading.markers",
    icon: <MarkerIcon />,
    url: "/markers",
    divider: false,
  },
  { divider: true },
  {
    text: "heading.labels",
    icon: <LabelsIcon />,
    url: "/labels",
    divider: false,
  },
  {
    text: "heading.viewHistory",
    icon: <ViewHistoryIcon />,
    url: "/view-history",
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
  setSidebar: (x: boolean) => void;
};

export default function Sidebar({ active, setSidebar }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const { enabled: safeMode, toggle: toggleSafeMode } = useContext(SafeModeContext);
  const { theme, toggle: toggleTheme } = useContext(ThemeContext);
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
        {links.map((link, i) => (
          <Fragment key={i}>
            {link.divider ? (
              <hr style={{ width: "100%", opacity: 0.33 }} />
            ) : (
              <SidebarLink onClick={() => setSidebar(false)} icon={link.icon} url={link.url}>
                {t(link.text, { numItems: 2 })}
              </SidebarLink>
            )}
          </Fragment>
        ))}
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div style={{ gap: 10, display: "flex", alignItems: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 5, gap: 8 }}>
          {theme === "dark" ? (
            <DarkThemeIcon className="hover" size={24} onClick={toggleTheme} />
          ) : (
            <LightThemeIcon className="hover" size={24} onClick={toggleTheme} />
          )}
          {safeMode ? (
            <SafeModeIcon className="hover" size={24} onClick={toggleSafeMode} />
          ) : (
            <UnsafeModeIcon className="hover" size={24} onClick={toggleSafeMode} />
          )}
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
      {active && (
        <div className="mobile-sidebar-darken" style={{}} onClick={() => setSidebar(false)} />
      )}
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
