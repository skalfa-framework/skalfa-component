"use client"

import { InputHTMLAttributes, ReactNode, useEffect, useState } from "react";
import { Icon } from "@skalfa/skalfa-icon";
import { cn, pcn, useInputHandler, useInputRandomId, useValidation, validation, ValidationRules } from "@utils";



type CT = "label" | "tip" | "error" | "base" | "icon";

export interface InputPasswordProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label      ?:  string;
  tip        ?:  string | ReactNode;
  leftIcon   ?:  any;
  rightIcon  ?:  any;

  value        ?:  string;
  invalid      ?:  string;
  validations  ?:  ValidationRules;

  onChange  ?:  (value: string, confirm?: string) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::". */
  className  ?:  string;
}



export function InputPasswordComponent({
  label,
  tip,
  leftIcon,
  rightIcon,

  value,
  invalid,
  validations,

  register,
  unregister,
  onChange,

  className = "",
  ...props
}: InputPasswordProps) {
  const [password, setPassword]                =  useState("");
  const [confirmPassword, setConfirmPassword]  =  useState("");
  const [strength, setStrength]                =  useState<"weak" | "strong" | "excellent" | "">("");


  // =========================>
  // ## Initial
  // =========================>
  const inputHandler     =  useInputHandler(props.name, value, validations, register, false)
  const randomId         =  useInputRandomId()
  const randomConfirmId  =  useInputRandomId()


  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage]  =  useValidation(inputHandler.value, validations, invalid, inputHandler.idle);


  // =========================>
  // ## Password strength handler
  // =========================>
  useEffect(() => {
    if (!password) return setStrength("");

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (hasLetter && !hasNumber && !hasSymbol) setStrength("weak");
    else if (hasLetter && hasNumber && !hasSymbol) setStrength("strong");
    else if (hasLetter && hasNumber && hasSymbol) setStrength("excellent");
    else setStrength("weak");
  }, [password]);


  // =========================>
  // ## Check match confirm password
  // =========================>
  const isConfirmMismatch = confirmPassword && password !== confirmPassword;


  return (
    <div className="input-container">
      {label && (
        <label
          htmlFor={randomId}
          className={cn(
            "input-label",
            props.disabled && "input-label-disabled",
            inputHandler.focus && "input-label-focus",
            !!invalidMessage && "input-label-error",
            pcn<CT>(className, "label"),
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
          )}
        >{tip}</small>
      )}

      <div className="relative">
        <input
          {...props}
          type="password"
          id={randomId}
          className={cn(
            "input",
            leftIcon && "input-with-left-icon",
            rightIcon && "input-with-right-icon",
            !!invalidMessage && "input-error",
            pcn<CT>(className, "base"),
          )}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            inputHandler.setIdle(false);
            onChange?.(e.target.value, confirmPassword);
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
              pcn<CT>(className, "icon")
            )}
            icon={leftIcon}
          />
        )}
        {rightIcon && (
          <Icon
            className={cn(
              "input-icon",
              "input-icon-right",
              pcn<CT>(className, "icon")
            )}
            icon={rightIcon}
          />
        )}
      </div>

      {invalidMessage && (
        <small className="input-error-message">
          {invalidMessage}
        </small>
      )}

      {strength && (
        <div className="flex items-center gap-2 mt-1">
          <div
            className={cn(
              "password-strength-bar",
              strength === "weak" && "password-strength-bar-weak",
              strength === "strong" && "password-strength-bar-strong",
              strength === "excellent" && "password-strength-bar-excellent",
            )}
          />
          <div
            className={cn(
              "password-strength-bar",
              strength === "weak" && "password-strength-bar-empty",
              strength === "strong" && "password-strength-bar-strong",
              strength === "excellent" && "password-strength-bar-excellent",
            )}
          />
          <div
            className={cn(
              "password-strength-bar",
              (strength === "weak" || strength === "strong") && "password-strength-bar-empty",
              strength === "excellent" && "password-strength-bar-excellent",
            )}
          />
          <span
            className={cn(
              "password-strength-text",
              strength === "weak" && "password-strength-text-weak",
              strength === "strong" && "password-strength-text-strong",
              strength === "excellent" && "password-strength-text-excellent",
            )}
          >
            {strength === "weak" ? "Weak" : strength === "strong" ? "Strong" : "Excellent"}
          </span>
        </div>
      )}

      <div className="input-password-confirm-wrapper">
        <label
          htmlFor={randomConfirmId}
          className={cn("input-label", pcn<CT>(className, "label"))}
        >Password Confirm</label>
        <div className="relative">
          <input
            {...props}
            id={randomConfirmId}
            type="password"
            className={cn(
              "input",
              leftIcon && "input-with-left-icon",
              rightIcon && "input-with-right-icon",
              pcn<CT>(className, "base"),
              isConfirmMismatch && "input-error",
            )}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              onChange?.(password, e.target.value);
            }}
            autoComplete="off"
          />
        </div>
      </div>

      {isConfirmMismatch && (
        <small className="input-error-message">Password confirmation not match</small>
      )}
    </div>
  );
}
