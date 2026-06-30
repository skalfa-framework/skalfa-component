"use client"

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHistory, faPowerOff, faUser, faUserCog } from "@fortawesome/free-solid-svg-icons";
import { ImageComponent, OutsideClickComponent } from "@components";
import { cn, auth } from "@utils";

export interface HeadbarUserProps {
  name      :  string;
  role      :  string;
  avatar   ?:  any;
}

export interface HeadbarProps {
  children      ?:  ReactNode;
  user          ?:  HeadbarUserProps;
  onLogout      ?:  () => void;
  onEditProfile ?:  () => void;
  className     ?:  string;
}

const defaultUser: HeadbarUserProps = {
  name: "Jhon Duck",
  role: "Admin",
};

export function HeadbarComponent({
  children,
  user = defaultUser,
  onLogout,
  onEditProfile,
  className = "",
}: HeadbarProps) {
  const router                 =  useRouter();
  const [profile, setProfile]  =  useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      auth.deleteAccessToken();
      router.push("/");
    }
  };

  const styles = {
    base: cn(
      "headbar-base",
      className,
    ),
  };

  return (
    <div className={styles.base}>
      <div className="w-full ">{children}</div>

      <div className="headbar-right-controls">
        <div className="headbar-icon-button">
          <FontAwesomeIcon icon={faHistory} />
        </div>
        <div className="headbar-icon-button">
          <FontAwesomeIcon icon={faBell} />
        </div>
        <div className="headbar-divider"></div>
        <div
          className="headbar-user-profile-trigger"
          onClick={() => setProfile(!profile)}
        >
          <div className="headbar-user-avatar-wrapper">
            {user.avatar ? (
              <ImageComponent src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
          </div>

          <div className="headbar-user-info">
            <h6 className="headbar-user-name">{user.name}</h6>
            <h6 className="headbar-user-role">{user.role}</h6>
          </div>
        </div>
      </div>

      <OutsideClickComponent onOutsideClick={() => setProfile(false)}>
        <div
          className={cn(
            "headbar-dropdown",
            profile ? "scale-y-100" : "scale-y-0"
          )}
        >
          <div className="headbar-dropdown-header">
            <div className="headbar-dropdown-avatar-wrapper">
              {user.avatar ? (
                <ImageComponent src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-2xl text-light-foreground"
                />
              )}
            </div>
            <div className="headbar-dropdown-user-info">
              <h6 className="text-lg font-bold line-clamp-1">{user.name}</h6>
              <h6 className="text-xs -mt-1 font-semibold line-clamp-1">
                {user.role}
              </h6>
            </div>
          </div>

          <div className="headbar-dropdown-body">
            <div 
              className="headbar-dropdown-item"
              onClick={onEditProfile}
            >
              <FontAwesomeIcon icon={faUserCog} />
              <label className="cursor-pointer font-semibold">
                Edit Profile
              </label>
            </div>
            <div
              className="headbar-dropdown-item-danger"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faPowerOff} />
              <label className="cursor-pointer font-semibold">Keluar</label>
            </div>
          </div>
        </div>
      </OutsideClickComponent>
    </div>
  );
}
