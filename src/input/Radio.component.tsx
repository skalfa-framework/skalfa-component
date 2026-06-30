"use client"

import { useEffect, useState } from "react";
import { cn, pcn, useInputRandomId } from "@utils";

type CT = "label" | "checked" | "error" | "input";

export interface RadioProps {
  name    :  string;
  label  ?:  string;

  value     ?:  string;
  disabled  ?:  boolean;
  checked   ?:  boolean;
  invalid   ?:  string;

  onChange  ?:  () => void;

  /** Use custom class with: "label::", "checked::", "error::". */
  className  ?:  string;
};

export function RadioComponent({
  name,
  label,

  value,
  disabled,
  checked,
  invalid,

  onChange,

  className = "",
}: RadioProps) {

  // =========================>
  // ## initial
  // =========================>
  const randomId                             =  useInputRandomId()
  const [invalidMessage, setInvalidMessage]  =  useState("");


  // =========================>
  // ## invalid handler
  // =========================>
  useEffect(() => {
    setInvalidMessage(invalid || "");
  }, [invalid]);


  return (
    <>
      <div className="radio-container">
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
            "radio-wrapper",
            disabled && "radio-wrapper-disabled"
          )}
        >
          <div
            className={cn(
              "radio-input",
              checked && "radio-input-checked",
              checked && pcn<CT>(className, "checked"),
              pcn<CT>(className, "input"),
            )}
          ></div>
          <div
            className={cn(
              "radio-label",
              checked && "radio-label-checked",
              pcn<CT>(className, "label"),
              checked && pcn<CT>(className, "label", "checked"),
              disabled && pcn<CT>(className, "label", "disabled"),
            )}
          >{label}</div>
        </label>

        {invalidMessage && (
          <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
        )}
      </div>
    </>
  );
}
