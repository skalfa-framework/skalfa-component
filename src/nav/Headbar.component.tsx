"use client"
import { cn, pcn } from "@utils";
import { useToggleContext } from "@contexts";
import { Icon, type IconName } from "@skalfa/skalfa-icon";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";



type CT = "base" | "left" | "right" | "title" | "toggle" | "back";

export interface HeadbarProps {
  title         ?:  string;
  backHref      ?:  string | boolean;
  rightContent  ?:  ReactNode;
  sidebarId     ?:  string;

  /** Use custom class with: "left::", "right::", "title::", "toggle::", "back::". */
  className     ?:  string;
};



export function HeadbarComponent({
  title,
  backHref,
  rightContent,
  sidebarId,
  className = "",
}: HeadbarProps) {
  const router  =  useRouter();
  const { toggle, setToggle }  =  useToggleContext();

  return (
    <div
      className={cn(
        "flex justify-between w-full items-center mt-2 mb-4 headbar",
        pcn<CT>(className, "base")
      )}
    >
      <div className={cn("flex items-center headbar-left", pcn<CT>(className, "left"))}>
        {toggle[`SIDEBAR${sidebarId ? ("_" + sidebarId?.toUpperCase()) : ""}`] && (
          <div
            className={cn(
              "w-8 aspect-square flex justify-center items-center cursor-pointer headbar-toggle headbar-sidebar-toggle",
              pcn<CT>(className, "toggle")
            )}
            onClick={() =>
              setToggle(
                `SIDEBAR${sidebarId ? ("_" + sidebarId?.toUpperCase()) : ""}`,
                !toggle[`SIDEBAR${sidebarId ? ("_" + sidebarId?.toUpperCase()) : ""}`]
              )
            }
          >
            <Icon icon="solid/sidebar" className="text-xl headbar-toggle-icon headbar-icon" />
          </div>
        )}
        {backHref && (
          <div
            className={cn(
              "w-8 aspect-square flex justify-center items-center cursor-pointer headbar-back headbar-back-button",
              pcn<CT>(className, "back")
            )}
            onClick={() =>
              typeof backHref != "boolean" ? router.push(backHref) : router.back()
            }
          >
            <Icon icon="solid/chevron-left" className="text-xl headbar-back-icon headbar-icon" />
          </div>
        )}
        <p className={cn("text-lg font-bold px-2 headbar-title", pcn<CT>(className, "title"))}>
          {title}
        </p>
      </div> 
      {rightContent && (
        <div className={cn("headbar-right", pcn<CT>(className, "right"))}>
          {rightContent}
        </div>
      )}
    </div>
  );
}

