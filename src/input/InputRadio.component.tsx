"use client"

import { ReactNode, useEffect, useState } from "react";
import { api, ApiType, cn, pcn, useInputHandler, useValidation, validation, ValidationRules } from "@utils";
import { RadioComponent } from "./Radio.component";



type CT = "label" | "tip" | "error" | "input" | "icon";

export type InputRadioOptionProps = {
  value: string | number;
  label: string;
};

export type InputRadioProps = {
  name                  :  string;
  label                ?:  string;
  tip                  ?:  string | ReactNode;
  vertical             ?:  boolean;

  value                ?:  string | number;
  disabled             ?:  boolean;
  invalid              ?:  string;
  options              ?:  InputRadioOptionProps[];
  serverOptionControl  ?:  ApiType;
  customOptions        ?:  any;
  validations          ?:  ValidationRules;

  onChange  ?:  (value: string | number) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::", "suggest::", "suggest-item::". */
  className            ?: string;
  /** Use custom class with: "label::", "checked::", "error::". */
  classNameCheckbox    ?: string;
};



export function InputRadioComponent({
  name,
  label,
  tip,
  vertical,

  value,
  disabled,
  invalid,

  options,
  serverOptionControl,
  customOptions,
  validations,

  onChange,
  register,
  unregister,

  className = "",
  classNameCheckbox = "",
}: InputRadioProps) {
  const [dataOptions, setDataOptions]  =  useState<InputRadioOptionProps[]>([]);
  const [loading, setLoading]          =  useState(false);


  // =========================>
  // ## Initial
  // =========================>
  const inputHandler  =  useInputHandler(name, value, validations, register, unregister, false)


  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage]  =  useValidation(inputHandler.value, validations, invalid, inputHandler.idle);


  // =========================>
  // ## Fetch option
  // =========================>
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      const mutateOptions = await api(serverOptionControl || {});
      if (mutateOptions?.status == 200) {
        customOptions
          ? setDataOptions([customOptions, ...mutateOptions.data])
          : setDataOptions(mutateOptions.data);
        setLoading(false);
      }
    };

    if (serverOptionControl?.path || serverOptionControl?.url) {
      fetchOptions();
    } else {
      !options && setDataOptions([]);
    }
  }, [serverOptionControl?.path, serverOptionControl?.url]);


  return (
    <>
      <div className="input-container w-full">
        <label
          className={cn(
            "input-label",
            disabled && "input-label-disabled",
            !!invalidMessage && "input-label-error",
            pcn<CT>(className, "label"),
            disabled && pcn<CT>(className, "label", "disabled"),
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
              disabled && "input-tip-disabled",
              pcn<CT>(className, "tip"),
              disabled && pcn<CT>(className, "tip", "disabled"),
            )}
          >{tip}</small>
        )}

        <div
          className={cn(
            "input input-radio-list",
            vertical && "input-radio-list-vertical",
            pcn<CT>(className, "input"),
            !!invalidMessage && "input-error",
            !!invalidMessage && pcn<CT>(className, "input", "error"),
          )}
        >
          {loading && (vertical ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3]).map((_, key) => {
            return <div key={key} className="w-1/3 h-6 rounded-lg"></div>;
          })}

          {(options || dataOptions) &&
            (options || dataOptions)?.map((option, key) => {
              return (
                <RadioComponent
                  key={key}
                  label={option.label}
                  name={`option[${option.value}]#${name}`}
                  checked={inputHandler.value == option.value}
                  disabled={disabled}
                  className={classNameCheckbox}
                  onChange={() => {
                    if (inputHandler.value == option.value) {
                      inputHandler.setValue("");
                      onChange?.("");
                    } else {
                      inputHandler.setValue(option.value || "");
                      onChange?.(option.value || "");
                    }
                  }}
                />
              );
            })}
        </div>

        {invalidMessage && (
          <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
        )}
      </div>
    </>
  );
}
