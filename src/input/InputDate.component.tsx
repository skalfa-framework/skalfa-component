"use client"

import { InputHTMLAttributes, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import { Icon } from "@skalfa/skalfa-icon";
import { cn, pcn, useInputHandler, useInputRandomId, useResponsive, useValidation, validation, ValidationRules } from "@utils";
import { BottomSheetComponent } from "../modal/BottomSheet.component";
import { ButtonComponent } from "../button/Button.component";
import { OutsideClickComponent } from "../wrap/OutsideClick.component";



type CT = "label" | "tip" | "error" | "input" | "icon";

export interface InputDateProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label      ?:  string;
  tip        ?:  string | ReactNode;
  leftIcon   ?:  any;
  rightIcon  ?:  any;

  value        ?:  string;
  invalid      ?:  string;
  validations  ?: ValidationRules;
  
  onChange  ?:  (value: string) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::". */
  className  ?:  string;
}



export function InputDateComponent({
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
}: InputDateProps) {
  const { isSm }  =  useResponsive();

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
            !!invalidMessage && pcn<CT>(className, "label", "error")
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
              props.disabled && pcn<CT>(className, "tip", "disabled")
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
                !!invalidMessage && "input-error",
                !!invalidMessage && pcn<CT>(className, "input", "error")
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
              onBlur={(e) => {
                props.onBlur?.(e);
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
                  props.disabled && pcn<CT>(className, "icon", "disabled"),
                  inputHandler.focus && pcn<CT>(className, "icon", "focus")
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
                  inputHandler.focus && pcn<CT>(className, "icon", "focus")
                )}
                icon={rightIcon}
              />
            )}

            {!isSm && inputHandler.focus && (
              <div className="input-date-picker-popover">
                <InputDatePickerComponent
                  value={inputHandler.value}
                  onChange={(e) => {
                    inputHandler.setValue(e);
                    inputHandler.setIdle(false);
                    onChange?.(e);
                    inputHandler.setFocus(false);
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
            <InputDatePickerComponent
              value={inputHandler.value}
              onChange={(e) => {
                inputHandler.setValue(e);
                inputHandler.setIdle(false);
                onChange?.(e);
              }}
            />
          </div>
        </BottomSheetComponent>
      )}
    </>
  );
}



export interface InputDatePickerProps {
  value         ?:  string;
  onChange      ?:  (date: string) => void;
  minDate       ?:  string;
  maxDate       ?:  string;
  rightElement  ?:  ReactNode;
};



export const InputDatePickerComponent: React.FC<InputDatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  rightElement,
}) => {
  const activeYearRef     =  useRef<HTMLDivElement | null>(null);
  const containerYearRef  =  useRef<HTMLDivElement | null>(null);

  const initialDate = useMemo(() => {
    return value && moment(value).isValid() ? moment(value) : moment();
  }, [value]);

  const [currentDate, setCurrentDate]    =  useState(initialDate);
  const [selectedDate, setSelectedDate]  =  useState(initialDate);

  useEffect(() => {
    if (value && moment(value).isValid()) {
      const m = moment(value);
      setCurrentDate(m);
      setSelectedDate(m);
    }
  }, [value]);

  const startDate  =  moment(currentDate).startOf("month").startOf("week");
  const endDate    =  moment(currentDate).endOf("month").endOf("week");

  const handlePrevMonth = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentDate(moment(currentDate).subtract(1, "month"));
  };
  const handleNextMonth = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentDate(moment(currentDate).add(1, "month"));
  };

  const handleDateClick = (date: moment.Moment) => {
    if ((minDate && date.isBefore(moment(minDate), "day")) || (maxDate && date.isAfter(moment(maxDate), "day"))) {
      return;
    }

    setSelectedDate(date);
    onChange?.(date.format("YYYY-MM-DD"));
  };

  const renderDays = () => {
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return dayNames.map((d, i) => (
      <div key={i} className="text-center text-[11px] font-semibold text-light-foreground">
        {d}
      </div>
    ));
  };

  const renderCells = () => {
    const rows  =  [];
    let   days  =  [];
    const day   =  moment(startDate);

    while (day.isBefore(endDate) || day.isSame(endDate, "day")) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = moment(day);
        const isCurrentMonth = day.isSame(currentDate, "month");
        const isSelected = day.isSame(selectedDate, "day");
        const isToday = day.isSame(moment(), "day");
        const isDisabled =
          (minDate && day.isBefore(moment(minDate), "day")) ||
          (maxDate && day.isAfter(moment(maxDate), "day"));

        days.push(
          <button
            key={day.format("YYYY-MM-DD")}
            type="button"
            className={cn(
              "w-8 h-8 text-xs flex items-center justify-center text-center rounded-lg transition-all border-none select-none",
              isCurrentMonth ? "text-foreground font-medium" : "text-light-foreground/40",
              isSelected ? "bg-primary text-white font-bold hover:bg-primary" : (
                isToday ? "border border-primary font-semibold hover:bg-light-primary" : "hover:bg-light-primary"
              ),
              isDisabled ? "opacity-20 cursor-not-allowed pointer-events-none" : "cursor-pointer"
            )}
            onClick={() => !isDisabled && handleDateClick(cloneDay)}
          >
            {day.format("D")}
          </button>
        );

        day.add(1, "day");
      }

      rows.push(<div key={day.format("YYYY-MM-DD-row")} className="grid grid-cols-7 gap-1">{days}</div>);

      days = [];
    }

    return rows;
  };

  const years = useMemo(() => {
    const dumpYears = [];

    for (let i = 1940; i <= moment().year() + 10; i++) {
      dumpYears.push(i);
    }

    return dumpYears;
  }, []);

  useEffect(() => {
    if (activeYearRef.current && containerYearRef.current) {
      const container = containerYearRef.current;
      const activeEl = activeYearRef.current;
      container.scrollTop = activeEl.offsetTop - container.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
    }
  }, [currentDate.year()]);

  return (
    <div className="w-full flex gap-2.5 h-[260px] select-none">
      <div
        className="w-[68px] shrink-0 h-full overflow-y-auto input-scroll pr-1 border-r border-stroke"
        ref={containerYearRef}
      >
        <div className="flex flex-col gap-0.5">
          {years?.map((item) => {
            const isActive = currentDate?.year() === item;

            return (
              <div
                key={item}
                ref={isActive ? activeYearRef : null}
                className={cn(
                  "py-1 px-2 font-semibold rounded-md cursor-pointer transition-colors text-center select-none",
                  isActive ? "bg-primary text-white" : "hover:bg-light-primary text-foreground"
                )}
                onClick={() => setCurrentDate(moment(currentDate).set("year", item))}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between pl-0.5">
        <div className="flex justify-between items-center mb-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 flex items-center justify-center text-xs rounded-full hover:bg-light-primary transition-colors cursor-pointer border-none bg-transparent"
          >
            <Icon icon="solid/chevron-left" className="w-3.5 h-3.5" />
          </button>
          <h2 className="font-semibold">
            {currentDate.format("MMMM YYYY")}
          </h2>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 flex items-center justify-center text-xs rounded-full hover:bg-light-primary transition-colors cursor-pointer border-none bg-transparent"
          >
            <Icon icon="solid/chevron-right" className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">{renderDays()}</div>
        <div className="flex flex-col gap-1">{renderCells()}</div>
      </div>

      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};
