"use client"

import { InputHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@skalfa/skalfa-icon";
import { cn, conversion, pcn, useInputHandler, useInputRandomId, useValidation, validation, ValidationRules } from "@utils";



type CT = "label" | "tip" | "error" | "input" | "icon";

export interface InputCurrencyProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label      ?:  string;
  tip        ?:  string | ReactNode;
  leftIcon   ?:  IconName;
  rightIcon  ?:  IconName;

  value        ?:  number;
  invalid      ?:  string;
  validations  ?: ValidationRules;
  format       ?:  {
    locale     ?:  string;
    currency   ?:  string;
  };

  onChange  ?:  (value: number) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::". */
  className  ?:  string;
}



export function InputCurrencyComponent({
  label,
  tip,
  leftIcon,
  rightIcon,

  value,
  invalid,
  
  validations,
  format,

  register,
  unregister,
  onChange,
  
  className = "",
  ...props
}: InputCurrencyProps) {

  // =========================>
  // ## Initial
  // =========================>
  const inputHandler = useInputHandler(props.name, value, validations, register, false, unregister)
  const randomId = useInputRandomId()


  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage] = useValidation(inputHandler.value, validations, invalid, inputHandler.idle);


  return (
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
          value={inputHandler.value ? conversion.currency(inputHandler.value, format?.locale, format?.currency) : ""}
          onChange={(e) => {
            const val = Number(e.target.value.replace(/[^0-9]/g,""));

            inputHandler.setValue(val);
            inputHandler.setIdle(false);
            
            onChange?.(val);
          }}
          onFocus={(e) => {
            props.onFocus?.(e);
            inputHandler.setFocus(true);
          }}
          onBlur={(e) => {
            props.onBlur?.(e);
            setTimeout(() => inputHandler.setFocus(false), 100);
          }}
          autoComplete="off"
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

      {invalidMessage && (
        <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
      )}
    </div>
  );
}
