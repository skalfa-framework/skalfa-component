"use client"

import React, { InputHTMLAttributes, ReactNode } from "react";
import { Icon } from "@skalfa/skalfa-icon";
import { cn, pcn, useInputHandler, useInputRandomId, useValidation, validation, ValidationRules } from "@utils";



type CT = "label" | "tip" | "error" | "input" | "icon";

export interface InputNumberProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label      ?:  string;
  tip        ?:  string | ReactNode;
  leftIcon   ?:  any;
  rightIcon  ?:  any;

  value        ?:  number;
  invalid      ?:  string;
  validations  ?:  ValidationRules;
  min          ?:  number;
  max          ?:  number;
  
  onChange  ?:  (value: number) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;
  
  /** Use custom class with: "label::", "tip::", "error::", "icon::", "suggest::", "suggest-item::". */
  className  ?:  string;
}



export function InputNumberComponent({
  label,
  tip,
  leftIcon,
  rightIcon,

  value,
  invalid,
  validations,
  min,
  max,

  onChange,
  register,
  unregister,

  className = "",
  ...props
}: InputNumberProps) {

  // =========================>
  // ## Initial
  // =========================>
  const inputHandler  =  useInputHandler(props.name, value, validations, register, false)
  const randomId      =  useInputRandomId()


  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage]  =  useValidation(inputHandler.value, validations, invalid, inputHandler.idle);


  // =========================>
  // ## Change value handler
  // =========================>
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    const regex = /^-?\d*\.?\d*$/;
    if (regex.test(newValue)) {
      inputHandler.setValue(newValue);
      inputHandler.setIdle(false);
      onChange?.(Number(newValue));
    }
  };


  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    setTimeout(() => inputHandler.setFocus(false), 100);
  };


  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onFocus?.(e);
    inputHandler.setFocus(true);
  };


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
            className={cn(
              "input",
              leftIcon && "input-with-left-icon",
              rightIcon && "input-with-right-icon",
              pcn<CT>(className, "input"),
              !!invalidMessage && "input-error",
              !!invalidMessage && pcn<CT>(className, "input", "error"),
            )}
            value={inputHandler.value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            min={min}
            max={max}
          />

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

          <label
            htmlFor={randomId}
            className={cn(
              "input-icon",
              "input-icon-right",
              props.disabled && "input-icon-disabled",
              inputHandler.focus && "input-icon-focus",
              pcn<CT>(className, "icon"),
              props.disabled && pcn<CT>(className, "icon", "disabled"),
              inputHandler.focus && pcn<CT>(className, "icon", "focus"),
            )}
          >
            <div className="input-number-sort-container">
              <Icon
                className="input-number-sort-up"
                icon="solid/chevron-up"
                onClick={() => inputHandler.setValue(String(Number(inputHandler.value) + 1))}
              />
              <Icon
                className="input-number-sort-down"
                icon="solid/chevron-down"
                onClick={() => inputHandler.setValue(String(Number(inputHandler.value) - 1))}
              />
            </div>
          </label>
        </div>

        {invalidMessage && (
          <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
        )}
      </div>
    </>
  );
}
