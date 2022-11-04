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
    <div style={{ padding: _padless ? 0 : 10 }}>
      <Head>
        <title>{title}</title>
      </Head>
      <div>{children}</div>
    </div>
  );
}
