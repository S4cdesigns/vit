import DropdownMenu, { DropdownItemGroup } from "@atlaskit/dropdown-menu";
import { OnOpenChangeArgs } from "@atlaskit/dropdown-menu/types";
import { MdiReactIconComponentType } from "mdi-react";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  value: boolean;
  activeIcon: MdiReactIconComponentType;
  inactiveIcon: MdiReactIconComponentType;
  children: ReactNode;
  counter?: number;
  isLoading?: boolean;
  disabled?: boolean;
  closeDropdown?: boolean;
};

const size = 24;

export default function IconButtonMenu({
  counter,
  children,
  value,
  activeIcon,
  inactiveIcon,
  isLoading,
  disabled,
  closeDropdown,
}: Props) {
  const Icon = value ? activeIcon : inactiveIcon;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (closeDropdown) {
      setIsOpen(false);
    }
  }, [closeDropdown]);

  return (
    <DropdownMenu
      appearance="tall"
      isLoading={isLoading}
      autoFocus={false}
      isOpen={isOpen}
      onOpenChange={(attrs: OnOpenChangeArgs) => {
        setIsOpen(attrs.isOpen);
      }}
      trigger={({ triggerRef, onClick }) => (
        <div
          style={{ position: "relative", display: "flex", alignItems: "center" }}
          className="hover"
          onClick={(ev) => {
            if (!disabled) {
              onClick?.(ev);
            }
          }}
          ref={triggerRef as any}
        >
          <Icon
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
            }}
            size={size}
          />
          {!!counter && (
            <div
              style={{
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 11,
                color: "black",
                backgroundColor: "#aaaaff",
                width: 14,
                height: 14,
                position: "absolute",
                right: -4,
                bottom: 0,
                borderRadius: "50%",
              }}
            >
              {counter}
            </div>
          )}
        </div>
      )}
    >
      <DropdownItemGroup>
        <div style={{ padding: "4px 10px" }}>{children}</div>
      </DropdownItemGroup>
    </DropdownMenu>
  );
}
