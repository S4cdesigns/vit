import ExternalLinkIcon from "mdi-react/ExternalLinkIcon";
import InstagramIcon from "mdi-react/InstagramIcon";
import TwitterIcon from "mdi-react/TwitterIcon";
import { ReactNode, useMemo } from "react";

import Text from "../Text";

type Props = {
  url: string;
  children: ReactNode;
};

export default function ExternalLink({ url, children }: Props) {
  const Icon = useMemo(() => {
    if (url.includes("twitter.com")) {
      return TwitterIcon;
    }
    if (url.includes("instagram.com")) {
      return InstagramIcon;
    }
    return ExternalLinkIcon;
  }, [url]);

  return (
    <a className="hover" key={url} href={url} target="_blank" rel="noopener,noreferrer">
      <Icon size={13} /> <Text style={{ display: "inline" }}>{children}</Text>
    </a>
  );
}
