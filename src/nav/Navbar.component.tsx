"use client"
import { Icon, type IconName } from "@skalfa/skalfa-icon";


import Link from "next/link";
import { ButtonComponent } from "../button/Button.component";
import { cn } from "@utils";

export interface NavbarItemProps {
  label: string;
  path: string;
}

export interface NavbarProps {
  logoTitle    ?:  string;
  logoSubtitle ?:  string;
  logoPath     ?:  string;
  specialLink  ?:  { label: string; path: string; icon?: IconName };
  items        ?:  NavbarItemProps[];
  isLoggedIn   ?:  boolean;
  onLogin      ?:  () => void;
  onRegister   ?:  () => void;
  onProfile    ?:  () => void;
  className    ?:  string;
}

const defaultItems: NavbarItemProps[] = [
  { label: "Tentang", path: "" },
  { label: "Artikel", path: "" },
  { label: "Bantuan", path: "" },
];

const defaultSpecialLink = {
  label: "Special Link",
  path: "",
  icon: "solid/store",
} as const;

export function NavbarComponent({
  logoTitle     =  "Next Light v.3",
  logoSubtitle  =  "The Magic Starter Template",
  logoPath      =  "/",
  specialLink   =  defaultSpecialLink,
  items         =  defaultItems,
  isLoggedIn    =  false,
  onLogin,
  onRegister,
  onProfile,
  className = "",
}: NavbarProps) {
  return (
    <>
      <div className={cn("navbar-topbar", className)}>
        <div className="navbar-container">
          <h2 className="text-base">
            Ini untuk
            <Link href={specialLink.path} className="navbar-special-link">
              {specialLink.icon && <Icon icon={specialLink.icon} className="mr-1" />}
              {specialLink.label}
            </Link>
          </h2>

          <div className="navbar-menu">
            {items.map((item, key) => (
              <Link href={item.path} key={key}>
                <div className="navbar-menu-item-sm">{item.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="navbar-main">
        <div className="navbar-main-container">
          <Link href={logoPath}>
            <div className="w-max">
              <h1 className="navbar-logo-title">
                {logoTitle}
              </h1>
              {logoSubtitle && (
                <p className="navbar-logo-subtitle">
                  {logoSubtitle}
                </p>
              )}
            </div>
          </Link>

          <div className="flex gap-12 items-center">
            <div className="navbar-menu">
              {items.map((item, key) => (
                <Link href={item.path} key={key}>
                  <div className="navbar-menu-item-base">{item.label}</div>
                </Link>
              ))}
            </div>

            <div className="w-full flex items-center gap-8">
              {!isLoggedIn ? (
                <div className="navbar-auth-buttons">
                  <ButtonComponent
                    label={"Masuk"}
                    size={"sm"}
                    onClick={onLogin}
                  />
                  <ButtonComponent
                    label={"Daftar"}
                    size={"sm"}
                    variant="light"
                    onClick={onRegister}
                  />
                </div>
              ) : (
                <div className="flex gap-2 w-max items-center">
                  <div className="p-2 text-light-foreground hover:text-foreground cursor-pointer">
                    <Icon icon="solid/history" />
                  </div>
                  <div className="p-2 text-light-foreground hover:text-foreground cursor-pointer">
                    <Icon icon="solid/bell" />
                  </div>
                  <div className="h-5 w-[1px] bg-foreground mx-2.5"></div>
                  <div
                    className="flex items-center gap-2.5 px-4 cursor-pointer -ml-2 text-light-foreground hover:text-foreground"
                    onClick={onProfile}
                  >
                    <div className="h-10 bg-background rounded-full aspect-square overflow-hidden flex justify-center items-center">
                      <Icon icon="solid/user" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
