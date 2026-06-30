"use client"

import { cn } from "@utils";



export interface CardProps {
  children    :  React.ReactNode;
  className  ?:  string;
}



export function CardComponent({
  children,
  className,
}: CardProps) {
  return (
    <>
      <div className={cn("card", className)}>
        {children}
      </div>
    </>
  );
}
