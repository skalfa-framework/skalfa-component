"use client"

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@utils";



export interface DashboardCardProps {
  content       ?:  string | ReactNode;
  title         ?:  string | ReactNode;
  rightContent  ?:  string | ReactNode;
  path          ?:  string;
  className     ?:  string;
}



export function DashboardCardComponent({
  content,
  title,
  rightContent,
  path,
  className,
} : DashboardCardProps) {
  return (
    <>
      <Link href={path || ""}>
        <div
          className={cn(
            "dashboard-card",
            className,
          )}
        >
          <div>
            <div className="flex gap-4 items-center">{content}</div>
            {title}
          </div>
          <div>{rightContent}</div>
        </div>
      </Link>
    </>
  );
}
