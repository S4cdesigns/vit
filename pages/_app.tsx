import "../styles/global.scss";
import "nprogress/nprogress.css";
import "react-image-crop/src/ReactCrop.scss";

import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import { NextIntlProvider } from "next-intl";
import nprogress from "nprogress";
import { createContext, useEffect, useState } from "react";

import Layout from "../components/app/Layout";
import lang from "../locale";
import { SafeModeContext } from "../composables/use_safe_mode";

Router.events.on("routeChangeStart", () => nprogress.start());
Router.events.on("routeChangeComplete", () => nprogress.done());
Router.events.on("routeChangeError", () => nprogress.done());

type Theme = "light" | "dark";

export const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({
  theme: "light",
  toggle: () => {},
});

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const [theme, setTheme] = useState<Theme>("light");
  const [safeMode, setSafeMode] = useState(false);

  function toggleTheme(): void {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  }

  function toggleSafeMode(): void {
    const nextMode = !safeMode;
    setSafeMode(nextMode);
    localStorage.setItem("safeMode", String(nextMode));
  }

  useEffect(() => {
    if (theme === "dark") {
      document.querySelector("html")?.classList.add("dark");
    } else {
      document.querySelector("html")?.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const themeLocalStorage = localStorage.getItem("theme");
    if (["light", "dark"].includes(themeLocalStorage!)) {
      setTheme(themeLocalStorage as Theme);
    }

    const safeModeLocalStorage = localStorage.getItem("safeMode");
    if (["true", "false"].includes(safeModeLocalStorage!)) {
      setSafeMode(safeModeLocalStorage === "true");
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0"
        />
        <link rel="shortcut icon" href="/assets/favicon.png" />
        <title>Porn Vault</title>
      </Head>
      <NextIntlProvider messages={lang[router.locale || "en"]}>
        <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
          <SafeModeContext.Provider value={{ enabled: safeMode, toggle: toggleSafeMode }}>
            <Layout>
              <Component key={router.asPath} {...pageProps} />
            </Layout>
          </SafeModeContext.Provider>
        </ThemeContext.Provider>
      </NextIntlProvider>
    </>
  );
}
