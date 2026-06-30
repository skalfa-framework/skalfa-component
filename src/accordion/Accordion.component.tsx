"use client"

import { ReactNode, useEffect, useState } from "react";
import { faChevronDown, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn, pcn } from "@utils";



type CT = "container" | "head" | "active" | "base";

export interface AccordionProps {
  setActive   ?:  number | null;
  items        :  { head: ReactNode; content: ReactNode }[];
  horizontal  ?:  boolean;
  className   ?:  string;
};



export function AccordionComponent({
  items,
  setActive = null,
  horizontal = false,

  /** Use custom class with: "container::", "head::", "active::". */
  className = "",
}: AccordionProps) {
  const [isActive, setIsActive] = useState<number | null>(setActive);

  useEffect(() => {
    setIsActive(setActive);
  }, [setActive]);

  return (
    <div
      className={cn(
        "accordion",
        horizontal ? "accordion-horizontal" : "accordion-vertical",
        pcn<CT>(className, "container"),
      )}
    >
      {items.map(({ head, content }, key) => (
        <div
          key={key}
          className={cn(
            "accordion-item",
            horizontal ? "accordion-item-horizontal" : "accordion-item-vertical",
          )}
        >
          <div
            className={cn(
              "accordion-head",
              horizontal ? "accordion-head-horizontal" : "accordion-head-vertical",
              pcn<CT>(className, "head"),
            )}
            onClick={() => setIsActive(isActive === key ? null : key)}
          >
            <div>{head}</div>
            <div
              className={cn(
                "w-min transition-transform",
                isActive !== key && "rotate-180",
              )}
            >
              <FontAwesomeIcon icon={horizontal ? faChevronLeft : faChevronDown} />
            </div>
          </div>
          <div
            className={cn(
              "accordion-content",
              horizontal
                ? isActive === key
                  ? "accordion-content-horizontal-active"
                  : "accordion-content-horizontal-inactive"
                : isActive === key
                ? "accordion-content-vertical-active"
                : "accordion-content-vertical-inactive",
              pcn<CT>(className, "base"),
              isActive === key && pcn<CT>(className, "active"),
            )}
          >{content}</div>
        </div>
      ))}
    </div>
  );
}
