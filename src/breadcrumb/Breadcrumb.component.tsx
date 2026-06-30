"use client"

import { Fragment, ReactNode } from "react";
import Link from "next/link";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn, pcn } from "@utils";



type CT = "container" | "active" | "base";

export interface BreadcrumbItemProps {
  path        :  string;
  label       :  string;
  className  ?:  string;
};

export interface BreadcrumbProps {
  items              :  BreadcrumbItemProps[];
  square            ?:  boolean;
  separatorContent  ?:  string | ReactNode;

  /** Use custom class with: "container::", "active::". */
  className  ?:  string;
};


export function BreadcrumbComponent({
  items,
  className  =  "",
  square     =  false,
  separatorContent,
}: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "breadcrumb",
        pcn<CT>(className, "container"),
      )}
    >
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isActive = index === items.length - 1;

          return (
            <Fragment key={item.path}>
              <li>
                <Link
                  href={item.path}
                  className={cn(
                    "breadcrumb-link",
                    square && "breadcrumb-link-square",
                    isActive && !square && "breadcrumb-link-active",
                    isActive && square && "breadcrumb-link-square-active",
                    pcn<CT>(className, "base"),
                    isActive && pcn<CT>(className, "active"),
                  )}
                >
                  {item.label}
                </Link>
              </li>
              
              {!isActive && (
                <li className="breadcrumb-separator">
                  {separatorContent || (
                    <FontAwesomeIcon
                      icon={faChevronRight}
                    />
                  )}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
