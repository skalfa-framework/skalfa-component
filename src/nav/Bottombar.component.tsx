"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faCrosshairs, faHome, faSackDollar, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { cn, pcn, useKeyboardOpen } from "@utils";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface BottombarItemProps {
  icon       :  IconDefinition;
  path       :  string;
  activeKey ?:  string;
}

export interface BottombarProps {
  active     ?:  string;
  items      ?:  BottombarItemProps[];
  className  ?:  string;
}

const defaultItems: BottombarItemProps[] = [
  { icon: faHome, path: "/_example/bottombar", activeKey: "home" },
  { icon: faClipboard, path: "/", activeKey: "clipboard" },
  { icon: faCrosshairs, path: "/", activeKey: "crosshairs" },
  { icon: faSackDollar, path: "/", activeKey: "sack-dollar" },
  { icon: faUserCircle, path: "/", activeKey: "profile" },
];

export function BottombarComponent({
  className = "",
  active,
  items = defaultItems,
}: BottombarProps) {
  const pathname = usePathname();
  const isKeyboardOpen  =  useKeyboardOpen();

  const styles = {
    base: cn(
      "bottombar-base",
      isKeyboardOpen ? "-bottom-60" : "bottom-3",
      pcn(className, "base"),
    ),
    item: "bottombar-item",
  };

  return (
    <>
      <div className={styles.base}>
        <div className="grid grid-cols-5 gap-2 items-center" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item, key) => {
            const isActive = pathname === item.path || active === item.activeKey;
            return (
              <Link href={item.path} key={key}>
                <div
                  className={cn(
                    styles.item,
                    isActive && "bottombar-item-active",
                    pcn(className, "item"),
                    isActive && pcn(className, "active"),
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
