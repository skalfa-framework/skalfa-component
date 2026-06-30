"use client"

import Image from "next/image";
import { cn, pcn } from "@utils";



type CT = "label" | "image" | "base";

export interface GalleryCardProps {
  src   :  string;
  alt  ?:  string;

  /** Use custom class with: "label::", "image::". */
  className?: string;
}



export function GalleryCardComponent({
  src,
  alt = "",
  className = "",
} : GalleryCardProps) {
  return (
    <>
      <div className={pcn<CT>(className, "base")}>
        <Image
          src={src}
          alt={src}
          width={400}
          height={300}
          className={cn(
            "gallery-card-image",
            pcn<CT>(className, "image"),
          )}
        />

        <div
          className={cn(
            "gallery-card-label",
            pcn<CT>(className, "label"),
          )}
        >
          {alt}
        </div>
      </div>
    </>
  );
}
