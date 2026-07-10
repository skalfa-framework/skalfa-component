"use client"

import { Fragment, ReactNode, useEffect, useState, } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn, pcn } from "@utils";
import { useToggleContext } from "@contexts";
import { Icon } from "@skalfa/skalfa-icon";



type CT = "backdrop" | "base" | "head-item" | "item" | "child-item";

export interface SidebarItemProps {
  label          :  string;
  key           ?:  number;
  leftContent   ?:  any;
  rightContent  ?:  any;
  path          ?:  string;
  items         ?:  SidebarItemProps[];
  className     ?:  string;
};

export interface SidebarHeadItemProps {
  label       :  string;
  collapse   ?:  boolean;
  items      ?:  SidebarItemProps[];
  className  ?:  string;
};

export interface sidebarProps {
  id        ?:  string;
  head      ?:  any;
  footer    ?:  any;
  items     ?:  SidebarHeadItemProps[];
  basePath  ?:  string;

  /** Use custom class with: "backdrop::", "head-item::", "item::", "child-item::". */
  className?: string;
};

interface sidebarWrapperProps {
  path      ?:  string;
  onClick   ?:  () => void;
  children  ?:  any;
}




function SidebarWrapper({
  path,
  children,
  onClick,
} : sidebarWrapperProps) {
  if (path) {
    return <Link href={path}>{children}</Link>;
  } else {
    return <div onClick={() => onClick?.()}>{children}</div>;
  }
}



export function SidebarComponent({
  id,
  head,
  footer,
  items,
  basePath,
  className = "",
} : sidebarProps) {
  const pathName               =  usePathname();
  const { toggle, setToggle }  =  useToggleContext()

  const [shows, setShows]  =  useState<string[]>([]);

  const setShow = (key: string) => {
    setShows((prevShows) => prevShows?.find((pk) => pk === key) ? prevShows.filter((pk) => pk !== key) : [...prevShows, key]);
  };

  const checkShow = (key: string): boolean => {
    if (shows?.includes(key)) {
      return true;
    }

    return false;
  };

  const cekActive = (path: string) => {
    const activePath =
      pathName?.split("?")[0]?.replace(`${basePath || ""}`, "") || "/";

    const currentPath = `${path ? `${path}` : ""}`;

    const isPrefix = (longer: string, shorter: string): boolean => {
      return (
        longer.startsWith(shorter) &&
        (longer === shorter || longer[shorter.length] === "/")
      );
    };

    return (
      isPrefix(activePath, currentPath) || isPrefix(currentPath, activePath)
    );
  };

  useEffect(() => {
    items?.map((head, head_key) => {
      head?.items?.map((menu, key) => {
        if (menu?.path && cekActive(menu?.path || "")) {
          setShow(`${head_key}`);
        }
        menu?.items?.map((child) => {
          if (child?.path && cekActive(child?.path || "")) {
            setShow(`${head_key}`);
            setShow(`${head_key}.${key}`);
          }
        });
      });
    });
  }, []);

  useEffect(() => {
    setToggle(`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`, false)
  }, [pathName]);

  return (
    <>
      <div 
        className={cn(
          "sidebar-backdrop",
          toggle[`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`] ? "scale-100 lg:scale-0" : "scale-0",
          pcn<CT>(className, "backdrop"),
        )} 
        onClick={() => setToggle(`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`)}
      ></div>
      <aside 
        className={cn(
          "sidebar-base scroll-sm",
          toggle[`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`] ? "w-full sm:w-[280px]" : "w-0 sm:w-14 lg:w-[280px]",
          pcn<CT>(className, "base"),
        )}
      >
        <div className={toggle[`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`] ? "block" : "hidden lg:block"}>
          {head}
        </div>

        <div 
          className={toggle[`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`] ? "hidden" : "flex justify-center pt-4 h-full lg:hidden"}
          onClick={() => setToggle(`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`)}
        >
          <Icon icon={"solid/bars"} />
        </div>

        <nav className={cn(
          "flex flex-col flex-1 overflow-hidden", 
          toggle[`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`] ? "w-full" : "w-0 lg:w-full",
        )}>
          {items?.map((menu_head, menu_head_key) => {
            return (
              <Fragment key={menu_head_key}>
                <div className="">
                  <div
                    className={cn(
                      "sidebar-head-item",
                      menu_head?.collapse && "cursor-pointer",
                      pcn<CT>(className, "head-item"),
                      menu_head?.className,
                    )}
                    onClick={() => setShow(String(menu_head_key))}
                  >
                    {menu_head?.label}
                    {menu_head.collapse && (
                      <Icon
                        icon={"solid/chevron-down"}
                        className={cn(
                          checkShow(String(menu_head_key)) && "rotate-180",
                        )}
                      />
                    )}
                  </div>

                  {(!menu_head?.collapse || checkShow(String(menu_head_key))) &&
                    menu_head?.items?.map((menu, menu_key) => {
                      return (
                        <Fragment key={`${menu_head_key}.${menu_key}`}>
                          <SidebarWrapper
                            path={
                              menu?.path ? `${basePath || ""}${menu?.path}` : ""
                            }
                            onClick={() =>
                              setShow(`${menu_head_key}.${menu_key}`)
                            }
                          >
                            <div
                              className={cn(
                                "sidebar-item",
                                menu?.path && cekActive(menu?.path || "") && "sidebar-item-active",
                                pcn<CT>(className, "item"),
                                menu?.className,
                              )}
                            >
                              <div className="flex gap-2 items-center">
                                {menu?.leftContent}
                                <span className="font-medium">
                                  {menu?.label}
                                </span>
                              </div>
                              <div className="flex gap-2 items-center">
                                {menu?.rightContent}

                                {menu?.items?.length && (
                                  <Icon
                                    icon={"solid/chevron-up"}
                                    className={`text-[10px] ${
                                      checkShow(
                                        `${menu_head_key}.${menu_key}`,
                                      ) || "rotate-180"
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </SidebarWrapper>
                          <div className="px-4">
                            <div className="flex flex-col">
                              {menu?.items?.length &&
                                checkShow(`${menu_head_key}.${menu_key}`) &&
                                menu?.items?.map((child, menu_child_key) => {
                                  return (
                                    <Fragment
                                      key={`${menu_head_key}.${menu_key}.${menu_child_key}`}
                                    >
                                      <SidebarWrapper
                                        path={
                                          child?.path
                                            ? `${basePath || ""}${child?.path}`
                                            : ""
                                        }
                                        onClick={() =>
                                          setShow(
                                            `${menu_head_key}.${menu_key}.${menu_child_key}`,
                                          )
                                        }
                                      >
                                        <div
                                          className={cn(
                                            "sidebar-child-item",
                                            child?.path &&
                                              cekActive(child?.path || "") &&
                                              "sidebar-child-item-active",
                                            pcn<CT>(className, "child-item"),
                                            child?.className,
                                          )}
                                        >
                                          <div className="flex gap-2 items-center">
                                            {child?.leftContent}
                                            <span className="text-[10px] font-medium">
                                              {child?.label}
                                            </span>
                                          </div>
                                          <div className="flex gap-2 items-center">
                                            {child?.rightContent}

                                            {child?.items?.length && (
                                              <Icon
                                                icon={"solid/chevron-up"}
                                                className={`block text-[10px] ${
                                                  checkShow(
                                                    `${menu_head_key}.${menu_key}`,
                                                  ) || "rotate-180"
                                                }`}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </SidebarWrapper>
                                    </Fragment>
                                  );
                                })}
                            </div>
                          </div>
                        </Fragment>
                      );
                    })}
                </div>
              </Fragment>
            );
          })}
        </nav>

        <div className={toggle[`SIDEBAR${id ? "" : "_" + id?.toUpperCase()}`] ? "block" : "hidden lg:block"}>
          {footer}
        </div>
      </aside>
    </>
  );
}

export function SidebarContentComponent({ children }: { children: ReactNode }) {
  return (
    <main className="w-full sm:ml-14 sm:w-[calc(100vw-56px)] lg:ml-[280px] lg:w-[calc(100vw-280px)] min-h-screen overflow-x-hidden">
      {children}
    </main>
  );
}
