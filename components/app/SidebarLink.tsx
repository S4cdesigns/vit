import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

import styles from "./SidebarLink.module.scss";

type Props = {
  children: ReactNode;
  url: string;
  icon: ReactNode;
  onClick?: () => void;
};

export default function SidebarLink({ children, url, onClick, icon }: Props) {
  const router = useRouter();

  return (
    <Link key={url} href={url} passHref>
      <a onClick={onClick}>
        <div className={clsx(router.pathname === url ? styles.active : "", styles["sidebar-link"])}>
          {icon}
          <div>{children}</div>
        </div>
      </a>
    </Link>
  );
}
