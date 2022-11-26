import AddIcon from "mdi-react/AddIcon";
import DeleteIcon from "mdi-react/DeleteIcon";

import AutoLayout from "./AutoLayout";
import Spacer from "./Spacer";
import Subheading from "./Subheading";

type Value = {
  url: string;
  text: string;
}[];

type Props = {
  value: Value;
  onChange: (value: Value) => void;
};

export default function ExternalLinksEditor({ value, onChange }: Props) {
  function updateLinkUrl(idx: number, url: string): void {
    const newLinks = value.map((link, index) => {
      if (index !== idx) {
        return link;
      }

      return { url, text: link.text };
    });
    onChange?.(newLinks);
  }

  function updateLinkText(idx: number, text: string): void {
    const newLinks = value.map((link, index) => {
      if (index !== idx) {
        return link;
      }

      return { url: link.url, text };
    });
    onChange?.(newLinks);
  }

  function addExternalLink(): void {
    onChange?.([...value, { url: "", text: "" }]);
  }

  function removeLink(idx: number): void {
    onChange?.(value.filter((link, index) => idx !== index));
  }

  return (
    <div>
      <AutoLayout gap={10} layout="h">
        <Subheading>External Links</Subheading>
        <div style={{ marginLeft: "auto" }}>
          <AddIcon onClick={addExternalLink} className="hover" />
        </div>
      </AutoLayout>
      {value.map((link, idx) => (
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
