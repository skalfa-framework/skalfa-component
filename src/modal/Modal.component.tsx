"use client"

import { ReactNode, useEffect } from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { cn, pcn, shortcut } from "@utils";
import { ButtonComponent } from "@components";



type CT = "base" | "backdrop" | "header" | "footer";

export interface ModalProps {
  show       :  boolean;
  onClose    :  () => void;
  title     ?:  string | ReactNode;
  children  ?:  any;
  tip       ?:  string | ReactNode;
  footer    ?:  string | ReactNode;

  /** Use custom class with: "backdrop::", "header::", "footer::". */
  className  ?:  string;
};



export function ModalComponent({
  show,
  onClose,
  title,
  children,
  tip,
  footer,
  className = "",
}: ModalProps) {
  useEffect(() => {
    if (show) {
      document.getElementsByTagName("body")[0].style.overflow = "hidden";

      shortcut.register("escape", () => {
        onClose?.()
      }, "Kembali")
    } else {
      document.getElementsByTagName("body")[0].style.removeProperty("overflow");
    }

    return () => {
      shortcut.unregister("escape")
    }
  }, [show]);

  return (
    <>
      <div
        className={cn(
          "modal-backdrop",
          !show && "opacity-0 scale-0 -translate-y-full",
          pcn<CT>(className, "backdrop"),
        )}
        onClick={() => onClose()}
      ></div>

      <div
        className={cn(
          "modal",
          !show && "-translate-y-full opacity-0 scale-y-0",
          pcn<CT>(className, "base"),
        )}
      >
        {title && (
          <div className={cn("modal-header", pcn<CT>(className, "header"))}>
            <div>
              <h6 className="modal-title">{title}</h6>
              {tip && <p className="modal-tip">{tip}</p>}
            </div>

            <ButtonComponent
              icon={faTimes}
              variant="simple"
              paint="danger"
              onClick={() => onClose()}
            />
          </div>
        )}

        {show && children}

        {footer && (
          <div className={cn("modal-footer", pcn<CT>(className, "footer"))}>
            {show && footer}
          </div>
        )}
      </div>
    </>
  );
}
