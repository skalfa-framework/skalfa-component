"use client"
import { useToggleContext } from "@contexts";
import { Icon, type IconName } from "@skalfa/skalfa-icon";


import { useRouter } from "next/navigation";
import { ReactNode } from "react";



export interface HeadbarProps {
  title         ?:  string;
  backHref      ?:  string | boolean;
  rightContent  ?:  ReactNode;
  sidebarId     ?:  string;
};


export function HeadbarComponent({ title, backHref, rightContent, sidebarId }: HeadbarProps) {
  const router  =  useRouter();
  const { toggle, setToggle }  =  useToggleContext()

  return (
    <div className="flex justify-between w-full items-center mt-2 mb-4">
      <div className="flex items-center">
        {toggle[`SIDEBAR${sidebarId ? ("_" + sidebarId?.toUpperCase()) : ""}`] && (
          <div className="w-8 aspect-square flex justify-center items-center cursor-pointer " onClick={() => setToggle(`SIDEBAR${sidebarId ? ("_" + sidebarId?.toUpperCase()) : ""}`, !toggle[`SIDEBAR${sidebarId ? ("_" + sidebarId?.toUpperCase()) : ""}`])}>
            <Icon icon="solid/sidebar" className="text-xl" />
          </div>
        )}
        {backHref && (
          <div className="w-8 aspect-square flex justify-center items-center cursor-pointer" onClick={() => typeof backHref != "boolean" ? router.push(backHref) : router.back()}>
            <Icon icon="solid/chevron-left" className="text-xl" />
          </div>
        )}
        <p className="text-lg font-bold px-2">{title}</p>
      </div> 
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
