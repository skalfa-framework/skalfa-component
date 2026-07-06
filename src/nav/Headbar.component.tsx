"use client"

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { ReactNode } from "react";



export interface HeadbarProps {
  title         ?:  string;
  backHref      ?:  string | boolean;
  rightContent  ?:  ReactNode;
};




export function HeadbarComponent({ title, backHref, rightContent }: HeadbarProps) {
  const router  =  useRouter();

  return (
    <div className="flex justify-between w-full items-center mt-2 mb-4">
      <div className="flex items-center">
        {backHref && (
          <div className="w-8 aspect-square flex justify-center items-center cursor-pointer" onClick={() => typeof backHref != "boolean" ? router.push(backHref) : router.back()}>
            <FontAwesomeIcon icon={faChevronLeft} className="text-secondary text-xl" />
          </div>
        )}
        <p className="text-lg font-bold px-2">{title}</p>
      </div> 
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
}
