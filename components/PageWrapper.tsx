import Head from "next/head";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  padless?: boolean;
  title: string;
};

export default function PageWrapper({ children, padless, title }: Props) {
  const _padless = padless ?? false;

  return (
    <div
      style={{
        paddingTop: _padless ? 0 : 10,
        paddingLeft: _padless ? 0 : 10,
        paddingRight: _padless ? 0 : 10,
        paddingBottom: 10,
      }}
    >
      {/* container for modal windows to avoid z-index issues */}
      <div id="modal-portal" />
      <Head>
        <title>{title}</title>
      </Head>
      <div>{children}</div>
    </div>
  );
}
