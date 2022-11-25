import { useTranslations } from "next-intl";

import Button from "../components/Button";
import { useWindow } from "../composables/use_window";
import { IActor } from "../types/actor";
import Window from "./Window";

type Props = {
  onEdit: () => void;
  actorId: string;
};

export default function ActorImagesEditor({ onEdit, actorId }: Props) {
  const t = useTranslations();
  const { isOpen, close, open } = useWindow();
  console.log("hi");

  return (
    <>
      <Button onClick={open}>Manage images</Button>
      <Window onClose={close} isOpen={isOpen} title={t("actions.edit")} actions={<div>hallo</div>}>
        <div>THis is content</div>
      </Window>
    </>
  );
}
