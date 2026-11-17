"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { MenuIcon } from "@/components/icons";
import { isCurrent, MENU_LABEL, NAV_LABEL, navItems } from "@/lib/navigation";

type Props = { yourTeam: string };

// Links in the header on desktop; on phones a menu button opens them as a popover,
// which needs no JavaScript to open, and closes with Escape or a tap outside.
export function SiteNav({ yourTeam }: Props) {
  return <NavLinks yourTeam={yourTeam} pathname={usePathname()} />;
}

// Shown until the pathname is known: the same links, none marked current.
export function SiteNavFallback({ yourTeam }: Props) {
  return <NavLinks yourTeam={yourTeam} pathname={null} />;
}

function NavLinks({ yourTeam, pathname }: Props & { pathname: string | null }) {
  const menu = useRef<HTMLUListElement>(null);
  const close = () => {
    if (menu.current?.matches(":popover-open")) menu.current.hidePopover();
  };

  return (
    <nav aria-label={NAV_LABEL} className="site-nav">
      <button
        type="button"
        className="icon-button menu-button"
        popoverTarget="site-menu"
        aria-label={MENU_LABEL}
      >
        <MenuIcon />
      </button>
      <ul id="site-menu" popover="auto" ref={menu} className="nav-links">
        {navItems(yourTeam).map((item) => (
          <li key={item.section}>
            <Link
              href={item.href}
              className="nav-link"
              aria-current={
                pathname && isCurrent(pathname, item.section)
                  ? "page"
                  : undefined
              }
              onClick={close}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
