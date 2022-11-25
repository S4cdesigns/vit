import AddIcon from "mdi-react/AddIcon";
import DeleteIcon from "mdi-react/DeleteIcon";

import AutoLayout from "./AutoLayout";
import Spacer from "./Spacer";
import Subheading from "./Subheading";

type Props = {
  externalLinks: { url: string; text: string }[];
  addExternalLink: (link: { url: string; text: string }) => void;
  updateLinkUrl: (index: number, url: string) => void;
  updateLinkText: (index: number, url: string) => void;
  removeLink: (index: number) => void;
};

export default function ExternalLinksEditor({
  externalLinks,
  addExternalLink,
  updateLinkUrl,
  updateLinkText,
  removeLink,
}: Props) {
  return (
    <div>
      <AutoLayout gap={10} layout="h">
        <Subheading>External Links</Subheading>
        <div style={{ marginLeft: "auto" }}>
          <AddIcon onClick={() => addExternalLink({ url: "", text: "" })} className="hover" />
        </div>
      </AutoLayout>
      {externalLinks.map((link, idx) => (
        <AutoLayout gap={10} layout="v">
          <div>
            <input
              style={{ width: "100%" }}
              value={link.url}
              onChange={(ev) => updateLinkUrl(idx, ev.target.value)}
              placeholder="Enter the URL"
              type="url"
            />
          </div>
          <div>
            <input
              style={{ width: "90%" }}
              value={link.text}
              onChange={(ev) => updateLinkText(idx, ev.target.value)}
              placeholder="Enter the URLs text"
              type="text"
            />
            <DeleteIcon
              className="hover"
              onClick={() => removeLink(idx)}
              style={{ width: "10%", verticalAlign: "middle" }}
            />
          </div>
          <Spacer />
        </AutoLayout>
      ))}
    </div>
  );
}
