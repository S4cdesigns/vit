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

Router.events.on("routeChangeStart", () => nprogress.start());
Router.events.on("routeChangeComplete", () => nprogress.done());
Router.events.on("routeChangeError", () => nprogress.done());

type Theme = "light" | "dark";

export const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const [theme, setTheme] = useState<Theme>("light");

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
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
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeContext.Provider>
      </NextIntlProvider>
    </>
  );
}
