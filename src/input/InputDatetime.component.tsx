"use client"

import { InputHTMLAttributes, ReactNode, useEffect, useState } from "react";
import { Icon, type IconName } from "@skalfa/skalfa-icon";
import { cn, pcn, useInputHandler, useInputRandomId, useResponsive, useValidation, validation, ValidationRules } from "@utils";
import { OutsideClickComponent } from "../wrap/OutsideClick.component";
import { InputDatePickerComponent } from "./InputDate.component";
import { InputTimePickerComponent } from "./InputTime.component";
import { BottomSheetComponent } from "../modal/BottomSheet.component";
import { ButtonComponent } from "../button/Button.component";
import { TabbarComponent } from "../nav/Tabbar.component";



type CT = "label" | "tip" | "error" | "input" | "icon";

export interface InputDateTimeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label      ?:  string;
  tip        ?:  string | ReactNode;
  leftIcon   ?:  IconName;
  rightIcon  ?:  IconName;

  value        ?:  string;
  invalid      ?:  string;
  validations  ?: ValidationRules;
  
  onChange  ?:  (value: string) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::", "suggest::", "suggest-item::". */
  className  ?:  string;
}



export function InputDatetimeComponent({
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
}: InputDateTimeProps) {
  const { isSm }  =  useResponsive();

  const [pickerType, setPickerType]  =  useState<"date" | "time">("date");
  const [dateValue, setDateValue]    =  useState("");
  const [timeValue, setTimeValue]    =  useState("");


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
  // ## change value handler
  // =========================>
  useEffect(() => {
    inputHandler.setValue(value || "");
    value && inputHandler.setValue(false);

    if (value) {
      const [d, t] = value.split(" ");
      setDateValue(d || "");
      setTimeValue(t || "");
    }
  }, [value]);


  const handleChange = (date: string, time: string) => {
    const newVal = `${date} ${time}`;
    inputHandler.setValue(newVal.trim());
    onChange?.(newVal.trim());
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
            )}
          >{tip}</small>
        )}

        <OutsideClickComponent onOutsideClick={!isSm ? () => inputHandler.setFocus(false) : undefined}>
          <div className="relative">
            <input
              {...props}
              id={randomId}
              readOnly
              className={cn(
                "input",
                leftIcon && "input-with-left-icon",
                rightIcon && "input-with-right-icon",
                pcn<CT>(className, "input"),
                !!invalidMessage && "input-error"
              )}
              value={inputHandler.value}
              onFocus={(e) => {
                props.onFocus?.(e);
                inputHandler.setFocus(true);
              }}
              autoComplete="off"
              inputMode={isSm ? "none" : undefined}
            />

            {leftIcon && (
              <Icon
                className={cn(
                  "input-icon",
                  "input-icon-left",
                  props.disabled && "input-icon-disabled",
                  inputHandler.focus && "input-icon-focus",
                  pcn<CT>(className, "icon"),
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
                )}
                icon={rightIcon}
              />
            )}

            {!isSm && inputHandler.focus && (
              <>
                <div className="input-datetime-picker-popover">
                  <TabbarComponent 
                    items={[
                      {
                        label: "Tanggal",
                        value: 'date'
                      },
                      {
                        label: "Jam",
                        value: 'time'
                      },
                    ]}
                    active={pickerType}
                    onChange={(e) => setPickerType(e as "time" | "date")}
                    className="mb-4"
                  />
                  {pickerType === "date" ? (
                    <InputDatePickerComponent
                      onChange={(e) => {
                        setDateValue(e);
                        handleChange(e, timeValue);
                      }}
                    />
                  ) : (
                    <InputTimePickerComponent
                      onChange={(e) => {
                        setTimeValue(e);
                        handleChange(dateValue, e);
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </OutsideClickComponent>

        {invalidMessage && (
          <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
        )}
      </div>

      {isSm && (
        <BottomSheetComponent
          show={inputHandler.focus}
          onClose={() => inputHandler.setFocus(false)}
          size={430}
          footer={
            <div className="p-4">
              <ButtonComponent
                label="Selesai"
                variant="outline"
                onClick={() => inputHandler.setFocus(false)}
                block
              />
            </div>
          }
        >
          <div className="p-4">
            <TabbarComponent 
              items={[
                {
                  label: "Tanggal",
                  value: 'date'
                },
                {
                  label: "Jam",
                  value: 'time'
                },
              ]}
              active={pickerType}
              onChange={(e) => setPickerType(e as "time" | "date")}
              className="mb-4"
            />
            {pickerType === "date" ? (
              <InputDatePickerComponent
                onChange={(e) => {
                  setDateValue(e);
                  handleChange(e, timeValue);
                }}
              />
            ) : (
              <InputTimePickerComponent
                onChange={(e) => {
                  setTimeValue(e);
                  handleChange(dateValue, e);
                }}
              />
            )}
          </div>
        </BottomSheetComponent>
      )}
    </>
  );
}
