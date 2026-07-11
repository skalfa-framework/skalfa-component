"use client"
import { Icon, type IconName } from "@skalfa/skalfa-icon";


import Link from "next/link";

export interface FooterLinkProps {
  label: string;
  path: string;
}

export interface FooterColumnProps {
  title: string;
  items: FooterLinkProps[];
}

export interface FooterSocialProps {
  icon: IconName;
  path: string;
}

export interface FooterProps {
  brandTitle    ?:  string;
  brandSubtitle ?:  string;
  address       ?:  { label: string; path: string };
  phone         ?:  { label: string; path: string };
  email         ?:  { label: string; path: string };
  supportHours  ?:  string;
  socials       ?:  FooterSocialProps[];
  columns       ?:  FooterColumnProps[];
  copyrightLink ?:  { label: string; path: string };
}

const defaultSocials: FooterSocialProps[] = [
  { icon: "brands/facebook" as any, path: "" },
  { icon: "brands/linkedin" as any, path: "" },
  { icon: "brands/github" as any, path: "https://github.com/SE-JE" },
  { icon: "brands/instagram" as any, path: "https://www.instagram.com/seje.digital/" },
];

const defaultColumns: FooterColumnProps[] = [
  {
    title: "Link Menu",
    items: [
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
    ],
  },
  {
    title: "Link Menu",
    items: [
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
    ],
  },
  {
    title: "Link Menu",
    items: [
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
      { label: "Klik Link Menu 1", path: "" },
    ],
  },
];

export function FooterComponent({
  brandTitle     =  "Next Light v.3",
  brandSubtitle  =  "The Magic Starter Template",
  address        =  { label: "Soekarno Hatta No 27 C, Ponorogo, Jawa Timur, Indonesia", path: "https://maps.app.goo.gl/TY2QDjFPm3RfwjUq6" },
  phone          =  { label: "+62 888888888888", path: "https://wa.me/6281456140392" },
  email          =  { label: "example@gmail.com", path: "mailto:sejedigital@gmail.com" },
  supportHours   =  "24 / 7 Online Suport | Senin - Sabtu ( 09.00 s/d 17.00 )",
  socials        =  defaultSocials,
  columns        =  defaultColumns,
  copyrightLink  =  { label: "sejedigital.com 2020 - 2025", path: "https://sejedigital.com/" },
}: FooterProps) {
  return (
    <>
      <div className="footer-base">
        <div className="footer-brand-container">
          <h1 className="footer-brand-title">
            {brandTitle}
          </h1>
          {brandSubtitle && (
            <p className="footer-brand-subtitle">
              {brandSubtitle}
            </p>
          )}
        </div>

        <div className="footer-contact-container">
          {address && (
            <a
              href={address.path}
              className="footer-contact-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {address.label}
            </a>
          )}
          {phone && (
            <a
              href={phone.path}
              className="footer-contact-link"
            >
              {phone.label}
            </a>
          )}
          {email && (
            <a
              href={email.path}
              className="footer-contact-link"
            >
              {email.label}
            </a>
          )}
          {supportHours && (
            <p className="footer-support-hours">
              {supportHours}
            </p>
          )}

          {socials && socials.length > 0 && (
            <div className="footer-socials-container">
              {socials.map((social, key) => (
                <a href={social.path} key={key} target="_blank" rel="noopener noreferrer">
                  <Icon
                    icon={social.icon}
                    className="footer-social-icon"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns && columns.length > 0 && (
          <div className="footer-links-container">
            <div className="footer-links-grid">
              {columns.map((column, colKey) => (
                <nav aria-label={`Footer navigation ${column.title}`} key={colKey}>
                  <h6 className="footer-menu-title">
                    {column.title}
                  </h6>

                  <div className="footer-menu-list">
                    {column.items.map((item, itemKey) => (
                      <Link href={item.path} className="footer-menu-link" key={itemKey}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              ))}
            </div>
          </div>
        )}

        {copyrightLink && (
          <p className="footer-copyright">
            Copyright &copy;
            <a href={copyrightLink.path} className="ml-1" target="_blank" rel="noopener noreferrer">
              {copyrightLink.label}
            </a>
          </p>
        )}
      </div>
    </>
  );
}
