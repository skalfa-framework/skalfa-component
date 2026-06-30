"use client"

import { ReactNode, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { cn, pcn, useInputRandomId } from "@utils";

type CT  =  "label" | "checked" | "error" | "base";

export type CheckboxProps = {
  name    :  string;
  label  ?:  string | ReactNode;
  
  value     ?:  string;
  disabled  ?:  boolean;
  checked   ?:  boolean;
  invalid   ?:  string;
  
  onChange  ?:  () => void;

  /** Use custom class with: "label::", "checked::", "error::". */
  className  ?:  string;
};

export function CheckboxComponent({
  name,
  label,

  value,
  disabled = false,
  checked = false,
  invalid,

  onChange,

  className = "",
}: CheckboxProps) {

  // =========================>
  // ## Initial
  // =========================>
  const randomId                             =  useInputRandomId()
  const [invalidMessage, setInvalidMessage]  =  useState("");

  // =========================>
  // ## Invalid handler
  // =========================>
  useEffect(() => {
    setInvalidMessage(invalid || "");
  }, [invalid]);

  return (
    <div className="checkbox-container">
      <input
        type="checkbox"
        className="hidden"
        id={randomId}
        name={name}
        onChange={onChange}
        defaultChecked={checked}
        value={value}
        disabled={disabled}
      />

      <label
        htmlFor={randomId}
        className={cn(
          "checkbox-wrapper",
          disabled && "checkbox-wrapper-disabled"
        )}
      >
        <div>
          <div
            className={cn(
              "checkbox-input",
              checked && "checkbox-input-checked",
              checked && pcn<CT>(className, "checked"),
              pcn<CT>(className, "base"),
            )}
          >
            {checked && <FontAwesomeIcon icon={faCheck} className="text-sm" />}
          </div>
        </div>
        <span
          className={cn(
            "checkbox-label",
            checked && "checkbox-label-checked",
            pcn<CT>(className, "label"),
            checked && pcn<CT>(className, "label", "checked"),
            disabled && pcn<CT>(className, "label", "disabled"),
          )}
        >
          {label}
        </span>
      </label>

      {invalidMessage && (
        <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
      )}
    </div>
  );
}
