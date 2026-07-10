"use client"
import { Icon, type IconName } from "@skalfa/skalfa-icon";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, pcn, useKeyboardOpen } from "@utils";

export interface BottombarItemProps {
  icon       :  IconName;
  path       :  string;
  activeKey ?:  string;
}

export interface BottombarProps {
  active     ?:  string;
  items      ?:  BottombarItemProps[];
  className  ?:  string;
}

const defaultItems: BottombarItemProps[] = [
  { icon: "solid/home", path: "/_example/bottombar", activeKey: "home" },
  { icon: "solid/clipboard", path: "/", activeKey: "clipboard" },
  { icon: "solid/crosshairs", path: "/", activeKey: "crosshairs" },
  { icon: "solid/sack-dollar", path: "/", activeKey: "sack-dollar" },
  { icon: "solid/user-circle", path: "/", activeKey: "profile" },
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
                  <Icon icon={item.icon} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
