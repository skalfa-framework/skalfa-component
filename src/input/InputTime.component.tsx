"use client"

import { FC, InputHTMLAttributes, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@skalfa/skalfa-icon";
import { cn, pcn, useInputHandler, useInputRandomId, useResponsive, useValidation, validation, ValidationRules } from "@utils";
import { BottomSheetComponent } from "../modal/BottomSheet.component";
import { ButtonComponent } from "../button/Button.component";
import { OutsideClickComponent } from "../wrap/OutsideClick.component";



type CT = "label" | "tip" | "error" | "input"| "icon";

export interface InputTimeProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label        ?:  string;
  tip          ?:  string | ReactNode;
  leftIcon     ?:  any;
  rightIcon    ?:  any;

  value        ?:  string;
  invalid      ?:  string;
  validations  ?:  ValidationRules;
  showSeconds  ?:  boolean;

  onChange    ?:  (value: string) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::". */
  className    ?:  string;
}



export function InputTimeComponent({
  label,
  tip,
  leftIcon,
  rightIcon,
  
  value,
  invalid,
  validations,
  showSeconds,

  register,
  unregister,
  onChange,
  
  className = "",
  ...props
}: InputTimeProps) {
  const { isSm }  =  useResponsive();

  // =========================>
  // ## Initial
  // =========================>
  const inputHandler  =  useInputHandler(props.name, value, validations, register, false, unregister)
  const randomId      =  useInputRandomId()
  
  
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
              className={cn(
                "input",
                leftIcon && "input-with-left-icon",
                rightIcon && "input-with-right-icon",
                pcn<CT>(className, "input"),
                !!invalidMessage && "input-error"
              )}
              value={inputHandler.value}
              onChange={(e) => {
                inputHandler.setValue(e.target.value);
                inputHandler.setIdle(false);
                onChange?.(e.target.value);
              }}
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
              <div className="input-time-picker-popover">
                <InputTimePickerComponent
                  value={inputHandler.value}
                  showSeconds={showSeconds}
                  onChange={(time) => {
                    inputHandler.setValue(time);
                    inputHandler.setIdle(false);
                    onChange?.(time);
                  }}
                />
              </div>
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
          size={380}
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
            <InputTimePickerComponent
              value={inputHandler.value}
              showSeconds={showSeconds}
              onChange={(time) => {
                inputHandler.setValue(time);
                inputHandler.setIdle(false);
                onChange?.(time);
              }}
            />
          </div>
        </BottomSheetComponent>
      )}
    </>
  );
}



export interface InputTimePickerProps {
  value         ?:  string;
  showSeconds   ?:  boolean;
  onChange      ?:  (time: string) => void;
  rightElement  ?:  ReactNode;
};




export const InputTimePickerComponent: FC<InputTimePickerProps> = ({
  value,
  showSeconds = false,
  onChange,
  rightElement,
}) => {
  const parsed = useMemo(() => {
    if (!value || typeof value !== "string") {
      return { h: 0, m: 0, s: 0, hasValue: false };
    }
    const parts = value.split(":").map((p) => parseInt(p, 10));
    return {
      h: isNaN(parts[0]) ? 0 : Math.min(23, Math.max(0, parts[0])),
      m: isNaN(parts[1]) ? 0 : Math.min(59, Math.max(0, parts[1])),
      s: isNaN(parts[2]) ? 0 : Math.min(59, Math.max(0, parts[2])),
      hasValue: true,
    };
  }, [value]);

  const [hour, setHour]      =  useState(parsed.h);
  const [minute, setMinute]  =  useState(parsed.m);
  const [second, setSecond]  =  useState(parsed.s);

  const shouldShowSeconds = showSeconds || (typeof value === "string" && value.split(":").length >= 3 && value.split(":")[2] !== "");

  useEffect(() => {
    if (parsed.hasValue) {
      setHour(parsed.h);
      setMinute(parsed.m);
      setSecond(parsed.s);
    }
  }, [parsed]);

  const hours    =  Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes  =  Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const seconds  =  Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  const presetContainerRef  =  useRef<HTMLDivElement | null>(null);
  const activePresetRef     =  useRef<HTMLDivElement | null>(null);

  const hourContainerRef    =  useRef<HTMLDivElement | null>(null);
  const activeHourRef       =  useRef<HTMLDivElement | null>(null);

  const minuteContainerRef  =  useRef<HTMLDivElement | null>(null);
  const activeMinuteRef     =  useRef<HTMLDivElement | null>(null);

  const secondContainerRef  =  useRef<HTMLDivElement | null>(null);
  const activeSecondRef     =  useRef<HTMLDivElement | null>(null);

  const scrollToActive = (container: HTMLDivElement | null, active: HTMLDivElement | null) => {
    if (container && active) {
      container.scrollTop = active.offsetTop - container.offsetTop - (container.clientHeight / 2) + (active.clientHeight / 2);
    }
  };

  useEffect(() => {
    scrollToActive(hourContainerRef.current, activeHourRef.current);
    scrollToActive(minuteContainerRef.current, activeMinuteRef.current);
    if (shouldShowSeconds) {
      scrollToActive(secondContainerRef.current, activeSecondRef.current);
    }
    scrollToActive(presetContainerRef.current, activePresetRef.current);
  }, []);

  const emitChange = (newH: number, newM: number, newS: number) => {
    const hh = String(newH).padStart(2, "0");
    const mm = String(newM).padStart(2, "0");
    const ss = String(newS).padStart(2, "0");
    const formatted = shouldShowSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    onChange?.(formatted);
  };

  const handleSelect = (type: "h" | "m" | "s", val: number) => {
    let newH = hour;
    let newM = minute;
    let newS = second;

    if (type === "h") {
      newH = val;
      setHour(val);
    } else if (type === "m") {
      newM = val;
      setMinute(val);
    } else if (type === "s") {
      newS = val;
      setSecond(val);
    }

    emitChange(newH, newM, newS);
  };

  const handlePresetSelect = (presetStr: string) => {
    const parts = presetStr.split(":").map(Number);
    const newH = parts[0] ?? 0;
    const newM = parts[1] ?? 0;
    const newS = 0;
    setHour(newH);
    setMinute(newM);
    setSecond(newS);
    emitChange(newH, newM, newS);
  };

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let i = 0; i < 24 * 60; i += 30) {
      const h = Math.floor(i / 60);
      const m = i % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return slots;
  }, []);

  return (
    <div className="w-full flex gap-2 h-[260px] select-none text-xs">
      {/* 1. Presets Column */}
      <div className="w-20 shrink-0 h-full flex flex-col border-r border-stroke pr-1.5">
        <div className="text-[11px] font-semibold text-light-foreground text-center py-1 mb-1 border-b border-stroke">
          Preset
        </div>
        <div className="flex-1 overflow-y-auto input-scroll flex flex-col gap-0.5" ref={presetContainerRef}>
          {timeSlots.map((time) => {
            const isPresetActive = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` === time;
            return (
              <div
                key={time}
                ref={isPresetActive ? activePresetRef : null}
                className={cn(
                  "py-1.5 px-1 text-center font-medium rounded-md cursor-pointer transition-colors",
                  isPresetActive
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-light-primary text-foreground"
                )}
                onClick={() => handlePresetSelect(time)}
              >
                {time}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Hour Column */}
      <div className="flex-1 h-full flex flex-col">
        <div className="text-[11px] font-semibold text-light-foreground text-center py-1 mb-1 border-b border-stroke">
          Jam
        </div>
        <div className="flex-1 overflow-y-auto input-scroll flex flex-col gap-0.5" ref={hourContainerRef}>
          {hours.map((item) => {
            const active = Number(item) === hour;
            return (
              <div
                key={item}
                ref={active ? activeHourRef : null}
                onClick={() => handleSelect("h", Number(item))}
                className={cn(
                  "py-1.5 text-center font-medium rounded-md cursor-pointer transition-colors",
                  active
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-light-primary text-foreground"
                )}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Minute Column */}
      <div className="flex-1 h-full flex flex-col">
        <div className="text-[11px] font-semibold text-light-foreground text-center py-1 mb-1 border-b border-stroke">
          Menit
        </div>
        <div className="flex-1 overflow-y-auto input-scroll flex flex-col gap-0.5" ref={minuteContainerRef}>
          {minutes.map((item) => {
            const active = Number(item) === minute;
            return (
              <div
                key={item}
                ref={active ? activeMinuteRef : null}
                onClick={() => handleSelect("m", Number(item))}
                className={cn(
                  "py-1.5 text-center font-medium rounded-md cursor-pointer transition-colors",
                  active
                    ? "bg-primary text-white font-semibold"
                    : "hover:bg-light-primary text-foreground"
                )}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Second Column (Optional) */}
      {shouldShowSeconds && (
        <div className="flex-1 h-full flex flex-col">
          <div className="text-[11px] font-semibold text-light-foreground text-center py-1 mb-1 border-b border-stroke">
            Detik
          </div>
          <div className="flex-1 overflow-y-auto input-scroll flex flex-col gap-0.5" ref={secondContainerRef}>
            {seconds.map((item) => {
              const active = Number(item) === second;
              return (
                <div
                  key={item}
                  ref={active ? activeSecondRef : null}
                  onClick={() => handleSelect("s", Number(item))}
                  className={cn(
                    "py-1.5 text-center font-medium rounded-md cursor-pointer transition-colors",
                    active
                      ? "bg-primary text-white font-semibold"
                      : "hover:bg-light-primary text-foreground"
                  )}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};