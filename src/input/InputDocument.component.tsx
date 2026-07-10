"use client"
import { Icon, type IconName } from "@skalfa/skalfa-icon";


import { useState, useRef, InputHTMLAttributes, ReactNode } from "react";
import { cn, pcn, registry, useInputHandler, useInputRandomId, useResponsive, useValidation, validation, ValidationRules } from "@utils";
import { ButtonComponent } from "../button/Button.component";
import { FloatingPageComponent } from "../modal/FloatingPage.component";
import { BottomSheetComponent } from "../modal/BottomSheet.component";

const DocumentViewerComponent = (props: any) => {
  const Comp = registry.get("DocumentViewerComponent");
  return Comp ? <Comp {...props} /> : null;
};

const DocumentViewerIcon = (ext: string) => {
  const getIcon = registry.get("DocumentViewerIcon");
  return getIcon ? getIcon(ext) : null;
};



type DocFile = {
  id: string;
  file: File;
  url: string;
  type: string;
};

type CT = "label" | "tip" | "error" | "base" | "icon";

export interface InputDocumentProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label      ?:  string;
  tip        ?:  string | ReactNode;
  leftIcon   ?:  any;
  rightIcon  ?:  any;

  value        ?:  any;
  invalid      ?:  string;

  validations   ?:  ValidationRules;

  onChange  ?:  (value: any) => any;
  register    ?:  (name: string, validations  ?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::", "suggest::", "suggest-item::". */
  className  ?:  string;
}



export function InputDocumentComponent({
  label,
  tip,
  leftIcon,
  rightIcon,
  className = "",

  value,
  invalid,

  validations,

  register,
  unregister,
  onChange,

  ...props
} : InputDocumentProps) {
  const { isSm }  =  useResponsive();

  // =========================>
  // ## Initial
  // =========================>
  const inputHandler      =  useInputHandler(props.name, value, validations, register, props.type == "file")
  const randomId          =  useInputRandomId()

  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage]  =  useValidation(inputHandler.value, validations, invalid, inputHandler.idle);


  return (
    <>
      <div className="input-container">
        <label
          htmlFor={randomId}
          className={cn(
            "input-label",
            props.disabled && "input-label-disabled",
            inputHandler.focus && "input-label-focus",
            !!invalidMessage && "input-label-error",
            pcn<CT>(className, "label"),
            props.disabled && pcn<CT>(className, "label", "disabled"),
            inputHandler.focus && pcn<CT>(className, "label", "focus"),
            !!invalidMessage && pcn<CT>(className, "label", "focus"),
          )}
        >
          {label}
          {validations && validation.hasRules(validations, "required") && <span className="text-danger ml-1">*</span>}
        </label>

        {tip && (
          <small
            className={cn(
              "input-tip",
              props.disabled && "input-tip-disabled",
              pcn<CT>(className, "tip"),
              props.disabled && pcn<CT>(className, "tip", "disabled"),
            )}
          >{tip}</small>
        )}

        <div className="relative">
          <input
            {...props}
            id={randomId}
            placeholder={!inputHandler.value ? props.placeholder : ""}
            className={cn(
              "input cursor-pointer",
              props.type == "file" && "input-file",
              leftIcon && "input-with-left-icon",
              rightIcon && "input-with-right-icon",
              pcn<CT>(className, "base"),
              !!invalidMessage && "input-error",
              !!invalidMessage && pcn<CT>(className, "base", "error"),
            )}
            onFocus={(e) => {
              props.onFocus?.(e);
              inputHandler.setFocus(true);
            }}
            inputMode="none"
          />


          {(inputHandler.value) && (
            <div
              className={cn(
                "input-document-values",
                leftIcon ? "input-document-values-left-icon" : "input-document-values-no-icon"
              )} 
              style={{ maxWidth: `calc(100% - ${leftIcon ? "5.2rem" : "2rem"})` }}
              onClick={() => {
                inputHandler.setFocus(true);
              }}
            >
              {(Array.isArray(inputHandler.value) ? inputHandler.value : []).map((f) => {
                return (
                  <span
                    key={f.id}
                    className="input-document-value-item"
                  >
                    <Icon icon={DocumentViewerIcon(f.file.name.split(".").pop()?.toLowerCase())} className="text-light-foreground" />
                    <span className="line-clamp-1">{f.file.name}</span>
                  </span>
                )
              })}
            </div>
          )}

          {leftIcon && (
            <Icon
              className={cn(
                "input-icon",
                "input-icon-left",
                props.disabled && "input-icon-disabled",
                inputHandler.focus && "input-icon-focus",
                pcn<CT>(className, "icon"),
                props.disabled && pcn<CT>(className, "icon", "disabled"),
                inputHandler.focus && pcn<CT>(className, "icon", "focus"),
              )}
              icon={leftIcon}
            />
          )}

          {rightIcon && (
            <Icon
              className={cn(
                "input-icon",
                "input-icon-right",
                props.disabled && "input-icon-disabled",
                inputHandler.focus && "input-icon-focus",
                pcn<CT>(className, "icon"),
                props.disabled && pcn<CT>(className, "icon", "disabled"),
                inputHandler.focus && pcn<CT>(className, "icon", "focus"),
              )}
              icon={rightIcon}
            />
          )}
        </div>

        {invalidMessage && <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>}
      </div>

      {!isSm ? (
        <FloatingPageComponent
          show={inputHandler.focus}
          onClose={() => inputHandler.setFocus(false)}
          title={label}
          footer={
            <ButtonComponent
              label="Selesai"
              variant="outline"
              onClick={() => inputHandler.setFocus(false)}
              block
            />
          }
        >
          <InputDocumentPicker 
            value={inputHandler.value}
            onChange={(e) => {
              inputHandler.setValue(e);
              if (inputHandler.idle) inputHandler.setIdle(false);
              onChange?.(e)
            }}
          />

        </FloatingPageComponent>
      ) : (
        <BottomSheetComponent
          show={inputHandler.focus}
          onClose={() => inputHandler.setFocus(false)}
          size={'98vh'}
          footer={
            <ButtonComponent
              label="Selesai"
              variant="outline"
              onClick={() => inputHandler.setFocus(false)}
              block
            />
          }
        >
          <InputDocumentPicker 
            value={inputHandler.value}
            onChange={(e) => {
              inputHandler.setValue(e);
              if (inputHandler.idle) inputHandler.setIdle(false);
              onChange?.(e)
            }}
          />

        </BottomSheetComponent>
      )}
    </>
  );
}


export interface InputDocumentPickerProps {
  value     ?:  any[];
  onChange  ?:  (value: any[]) => void;
}

export const InputDocumentPicker: React.FC<InputDocumentPickerProps> = ({ value, onChange }) => {
  const { isSm }  =  useResponsive();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [previewActive, setPreviewActive] = useState<string | null>(null);

  const files: DocFile[] = Array.isArray(value) ? value : [];

  function updateFiles(next: DocFile[]) {
    onChange?.(next);
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files;
    if (!picked) return;

    const next = [...files];

    Array.from(picked).forEach((f) => {
      const id = Math.random().toString(36).substring(7);
      next.push({
        id,
        file: f,
        url: URL.createObjectURL(f),
        type: f.type,
      });

      if (!previewActive) setPreviewActive(id);
    });

    updateFiles(next);
    e.target.value = "";
  }

  function removeFile(id: string) {
    const next = files.filter((x) => x.id !== id);

    updateFiles(next);

    if (previewActive === id) {
      setPreviewActive(next[0]?.id || null);
    }
  }

  return (<>
    <div className="p-4 flex flex-col gap-4">
      <div className="input-document-dropzone">
        {files.find((x) => x.id === previewActive)?.file ? (
          <DocumentViewerComponent 
            file={files.find((x) => x.id === previewActive)?.file}
          />
        ) : (
          <div className="input-document-empty-box" onClick={() => fileInputRef.current?.click()}>
            <Icon icon="solid/plus" className="text-3xl" />
            <p className="text-lg">Tambah Dokumen</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFilePick}
      />

      <div className="input-document-thumbs-container">
        <div className="input-document-thumbs-grid">
          {files.map((f) => {
            return (
              <div
                key={f.id}
                className={cn(
                  "input-document-thumb-wrapper",
                  previewActive === f.id && "input-document-thumb-wrapper-active"
                )}
                onClick={() => setPreviewActive(f.id)}
              >
                <DocumentViewerComponent 
                  file={f.file}
                  mode="thumb"
                />

                <ButtonComponent
                  icon="solid/times"
                  onClick={() => removeFile(f.id)}
                  variant="light"
                  paint="danger"
                  className="absolute top-2 right-2"
                  size={isSm ? "xs" : "sm"}
                />
              </div>
            );
          })}

          <div className="input-document-upload-box" onClick={() => fileInputRef.current?.click()}>
            <Icon icon="solid/plus" />
            <p className="text-[10px] text-center">Tambah Dokumen</p>
          </div>
        </div>
      </div>
    </div>
  </>)
}