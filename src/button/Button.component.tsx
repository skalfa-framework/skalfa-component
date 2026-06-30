"use client"

import { ReactNode } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn, pcn } from "@utils";

type CT = "icon" | "loading" | "base";

export interface ButtonProps {
  type      ?:  "submit" | "button";
  label     ?:  string | ReactNode;
  variant   ?:  "solid" | "outline" | "light" | "simple";
  paint     ?:  "primary" | "secondary" | "success" | "danger" | "warning";
  rounded   ?:  boolean | string;
  block     ?:  boolean;
  disabled  ?:  boolean;
  size      ?:  "xs" | "sm" | "md" | "lg";
  onClick   ?:  any;
  href      ?:  string;
  icon      ?:  any;
  loading   ?:  boolean;
  hover     ?:  boolean;
  tips      ?:  string; // Tooltip / title attribute
  title     ?:  string;

  /** Use custom class with: "icon::", "loading::". */
  className?: string;
};

export function ButtonComponent({
  type       =  "button",
  label,
  variant    =  "solid",
  paint      =  "primary",
  rounded,
  block,
  disabled,
  size       =  "md",
  onClick,
  href,
  icon,
  loading,
  tips,
  title,
  className  =  "",
}: ButtonProps) {
  const isIconButton = icon && !label;

  return (
    <ButtonComponentWrapper
      type={type}
      className={cn(
        "button",
        `button-${variant}-${paint}`,
        isIconButton ? `icon-button-${size}` : `button-${size}`,
        rounded && "rounded-full",
        !isIconButton && block && "w-full justify-center",
        pcn<CT>(className, "base"),
      )}
      disabled={disabled || loading}
      onClick={onClick}
      href={href}
      title={tips || title}
    >
      {loading ? (
        <div className={cn("button-loading", pcn<CT>(className, "loading"))}></div>
      ) : (
        icon && (
          <FontAwesomeIcon
            icon={icon}
            className={cn("button-icon", pcn<CT>(className, "icon"))}
          />
        )
      )}
      {!isIconButton && label}
    </ButtonComponentWrapper>
  );
}

const ButtonComponentWrapper = ({ children, href, ...props }: ButtonProps & { children?: ReactNode }) => {
  return !href ? (
    <button {...(props as any)}>{children}</button>
  ) : (
    <Link href={href} {...(props as any)}>
      {children}
    </Link>
  );
};