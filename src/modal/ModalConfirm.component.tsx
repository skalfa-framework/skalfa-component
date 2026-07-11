"use client"

import { ReactNode, useEffect, useMemo, useState } from "react";
import { api, ApiType, cn, pcn, registry, shortcut, useResponsive } from "@utils";
import { ButtonComponent, ButtonProps, BottomSheetComponent } from "@components";
import { Icon } from "@skalfa/skalfa-icon";
import { useLang } from "@skalfa/skalfa-lang";



type CT = "base" | "backdrop" | "header" | "footer";

type SubmitIDB = { idb: { store: string , id: string | number}}

export interface ModalConfirmProps {
  show            :  boolean;
  onClose         :  () => void;
  title          ?:  string | ReactNode;
  children       ?:  any;
  icon           ?:  any;
  footer         ?:  string | ReactNode;
  submitControl  ?:  ButtonProps & {
    onSubmit     ?:  ApiType | SubmitIDB | (() => void);
    onSuccess    ?:  () => void;
    onError      ?:  () => void;
  };

  /** Use custom class with: "backdrop::", "header::", "footer::". */
  className  ?:  string;
};



export function ModalConfirmComponent({
  show,
  title,
  children,
  footer,

  submitControl,
  onClose,

  className = "",
}: ModalConfirmProps) {
  const l                      =  useLang()
  const { isSm }               =  useResponsive();
  const [toast, setToast]      =  useState<boolean | "success" | "failed">(false);
  const [loading, setLoading]  =  useState(false);

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
  

  const renderChildren = (actionSize: ButtonProps["size"] = 'md') => {
    if (toast == "success") {
      return (
        <div className="flex flex-col items-center justify-center h-full py-6 transition-all duration-300 animate-intro-down">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon icon={"solid/check"} className="text-primary text-2xl" />
          </div>
          <p className="text-primary text-lg font-semibold mt-4">{l.base.success ? l.base.success() : "Success"}</p>
        </div>
      )
    }

    return (
      <>
        {title && (
          <div
            className={cn(
              "flex flex-col gap-2 p-6",
              pcn<CT>(className, "header")
            )}
          >
            <h6 className="font-semibold text-lg">{title}</h6>
          </div>
        )}

        {children}

        {toast == "failed" && (
          <div className="px-4">
            <div className="mt-4 w-full p-4 rounded-sm border border-danger bg-light-danger flex gap-4 items-center">
              <div>
                <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                  <Icon icon={"solid/exclamation-triangle"} className="text-danger text-lg" />
                </div>
              </div>
              <p className="text-danger text-sm font-semibold">{l.base.confirmFailed ? l.base.confirmFailed() : "Failed"}</p>
            </div>
          </div>
        )}

        {renderAction(actionSize)}
      </>
    )
  }


  const renderAction = (size: ButtonProps["size"] = 'md') => {
    return (
      <div className="flex justify-center gap-4 p-6 pt-2">
        <ButtonComponent
          label={l.base.cancel ? l.base.cancel() : ""}
          variant="outline"
          onClick={() => onClose()}
          block
          size={size}
        />
        <ButtonComponent
          label={l.base.confirm ? l.base.confirm() : ""}
          loading={loading}
          onClick={async () => {
            if(!submitControl?.onSubmit) return;

            setLoading(true);
            if (typeof submitControl?.onSubmit == "function") {
              submitControl?.onSubmit?.();
            } else {
              let response: any = null;

              if ("path" in submitControl?.onSubmit || "url" in submitControl?.onSubmit) {
                response = await api(submitControl?.onSubmit as ApiType)
              }

              if ("idb" in submitControl?.onSubmit) {
                const idb = registry.get("idb");
                if (!idb) {
                  throw new Error("IndexedDB (IDB) extension is not installed.");
                }
                await idb.delete((submitControl?.onSubmit as SubmitIDB).idb.store, (submitControl?.onSubmit as SubmitIDB).idb.id)
                
                response = { status: 200 }
              }

              if (response?.status == 200 || response?.status == 201) {
                setToast("success");
                setTimeout(() => setToast(false), 1000);
                submitControl?.onSuccess?.();
                setLoading(false);
              } else {
                setToast("failed");
                setTimeout(() => setToast(false), 5000);
                submitControl?.onError?.();
                setLoading(false);
              }
            }
          }}
          block
          size={size}
          {...submitControl}
        />
      </div>
    )
  }

  return (
    <>
      {!isSm  ? (
        <>
          <div
            className={cn(
              "modal-backdrop",
              !show && "opacity-0 scale-0 -translate-y-full",
              pcn<CT>(className, "backdrop")
            )}
            onClick={() => onClose()}
          ></div>

          <div
            className={cn(
              "modal modal-confirm",
              !show && "-translate-y-full opacity-0 scale-y-0",
              pcn<CT>(className, "base")
            )}
          >
            {renderChildren()}
          </div>
        </>
      ) : (
        <>
          <BottomSheetComponent 
            show={show}
            onClose={onClose}
            size={220}
          >
            {renderChildren('lg')}
          </BottomSheetComponent>
        </>
      )}
    </>
  );
}
