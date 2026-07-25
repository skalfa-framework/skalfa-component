"use client"

import { TextareaHTMLAttributes, ReactNode, Ref, useEffect } from "react";
import { Icon, type IconName } from "@skalfa/skalfa-icon";
import { cn, pcn, useInputHandler, useInputRandomId, useValidation, validation, ValidationRules } from "@utils";

type CT = "label" | "tip" | "error" | "base" | "icon";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label        ?:  string;
  tip          ?:  string | ReactNode;
  leftIcon     ?:  IconName | any;
  rightIcon    ?:  IconName | any;

  value        ?:  any;
  invalid      ?:  string;

  validations  ?:  ValidationRules;
  onlyAlphabet ?:  boolean;
  uppercase    ?:  boolean;
  lowercase    ?:  boolean;

  onChange     ?:  (value: any) => any;
  register     ?:  (name: string, validations?: ValidationRules) => void;
  unregister   ?:  (name: string) => void;

  ref          ?:  Ref<HTMLTextAreaElement>;

  /** Use custom class with: "label::", "tip::", "error::", "base::", "icon::". */
  className    ?:  string;
}

export function TextareaComponent({
  label,
  tip,
  leftIcon,
  rightIcon,
  className = "",

  value,
  invalid,

  validations,
  onlyAlphabet,
  uppercase,
  lowercase,

  register,
  unregister,
  onChange,

  ref,
  ...props
}: TextareaProps) {

  // =========================>
  // ## Initial
  // =========================>
  const inputHandler = useInputHandler(props.name, value, validations, register, false, unregister);
  const randomId     = useInputRandomId();

  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage] = useValidation(inputHandler.value, validations, invalid, inputHandler.idle);

  // =========================>
  // ## Change value handler
  // =========================>
  useEffect(() => {
    if (inputHandler.value && typeof inputHandler.value === "string") {
      let newVal = onlyAlphabet ? inputHandler.value.replace(/[^A-Za-z ]+/g, "") : inputHandler.value;

      if (uppercase) newVal = newVal.toUpperCase();
      if (lowercase) newVal = newVal.toLowerCase();

      if (validations && validation.hasRules(validations, "max")) {
        newVal = newVal.slice(0, parseInt(validation.getRules(validations, "max") || "0"));
      }

      inputHandler.setValue(newVal);
    }
  }, [inputHandler.value, onlyAlphabet, uppercase, lowercase, validations]);

  return (
    <div className="relative flex flex-col gap-y-0.5 w-full">
      {label && (
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
            !!invalidMessage && pcn<CT>(className, "label", "error"),
          )}
        >
          {label}
          {validations && validation.hasRules(validations, "required") && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {tip && (
        <small
          className={cn(
            "input-tip",
            props.disabled && "input-tip-disabled",
            pcn<CT>(className, "tip"),
            props.disabled && pcn<CT>(className, "tip", "disabled"),
          )}
        >
          {tip}
        </small>
      )}

      <div className="relative">
        <textarea
          {...props}
          ref={ref}
          id={randomId}
          value={inputHandler.value ?? ""}
          onChange={(e) => {
            inputHandler.setValue(e.target.value);
            inputHandler.setIdle(false);
            if (onChange) onChange(e.target.value);
          }}
          onFocus={(e) => {
            props.onFocus?.(e);
            inputHandler.setFocus(true);
          }}
          onBlur={(e) => {
            props.onBlur?.(e);
            setTimeout(() => inputHandler.setFocus(false), 100);
          }}
          className={cn(
            "input textarea min-h-[80px] py-2",
            leftIcon && "input-with-left-icon",
            rightIcon && "input-with-right-icon",
            props.disabled && "input-disabled",
            !!invalidMessage && "input-error",
            pcn<CT>(className, "base"),
            !!invalidMessage && pcn<CT>(className, "base", "error"),
          )}
        />

        {leftIcon && (
          <Icon
            className={cn(
              "input-icon",
              "input-icon-left",
              "top-3 -translate-y-0",
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
              "top-3 -translate-y-0",
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
        <small
          className={cn(
            "input-error-message",
            pcn<CT>(className, "error"),
          )}
        >
          {invalidMessage}
        </small>
      )}
    </div>
  );
}
