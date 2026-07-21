"use client"
import { Icon, type IconName } from "@skalfa/skalfa-icon";


import { ReactNode, useEffect, useRef, useState } from "react";
import { api, ApiType, cavity, cn, pcn, registry, useInputHandler, useInputRandomId, useLazySearch, useValidation, validation, ValidationRules,} from "@utils";
import { OutsideClickComponent } from "../wrap/OutsideClick.component";



type CT = "label" | "tip" | "error" | "input" | "icon" | "suggest" | "suggest-item";

export interface SelectOptionProps {
  label         :  string | ReactNode;
  value         :  string | number;
  searchable   ?:  string[];
  customLabel  ?:  ReactNode;
};

export interface SelectProps {
  name          :  string;
  label        ?:  string;
  placeholder  ?:  string;
  tip          ?:  string | ReactNode;
  leftIcon     ?:  any;
  rightIcon    ?:  any;

  value        ?:  string | number | (string | number)[] | Record<string, any>;
  invalid      ?:  string;
  disabled     ?:  boolean;
  validations  ?:  ValidationRules;
  multiple     ?:  boolean;
  autoFocus    ?:  boolean;
  clearable    ?:  boolean;

  options              ?:  SelectOptionProps[];
  searchable           ?:  boolean;
  serverOptionControl  ?:  ApiType & { cacheName?: string | false };
  idbOptionControl     ?:  { store: string, labelKey: string, valueKey: string };
  serverSearchable     ?:  boolean;
  includedOptions      ?:  SelectOptionProps[];
  exceptOptions        ?:  (string | number)[];
  tempOptions          ?:  SelectOptionProps[];
  newOption            ?:  SelectOptionProps;
  maxShowOption        ?:  number;
  creatable            ?:  boolean | string;
  creatableLabel       ?:  string;

  onChange  ?:  (value: any, data?: any) => any;
  register    ?:  (name: string, validations?: ValidationRules) => void;
  unregister  ?:  (name: string) => void;
  onFocus   ?:  () => void;
  onBlur    ?:  () => void;

  /** Use custom class with: "label::", "tip::", "error::", "icon::", "suggest::", "suggest-item::". */
  className    ?:  string;
}



export function SelectComponent({
  name,
  label,
  placeholder,
  tip,
  leftIcon,
  rightIcon,

  value,
  invalid,
  disabled,
  validations,
  multiple,
  autoFocus,
  clearable,

  options = [],
  searchable,
  serverOptionControl,
  idbOptionControl,
  serverSearchable,
  includedOptions = [],
  exceptOptions = [],
  tempOptions,
  newOption,
  maxShowOption = 10,
  creatable,
  creatableLabel,

  register,
  unregister,
  onChange,
  onFocus,
  onBlur,

  className = "",
}: SelectProps) {
  const [inputShowValue, setInputShowValue]    =  useState<string | ReactNode>("");
  const [keydown, setKeydown]                  =  useState(false);
  const [useTemp, setUseTemp]                  =  useState(true);
  const [dataOptions, setDataOptions]          =  useState<SelectOptionProps[]>([]);
  const [filteredOptions, setFilteredOptions]  =  useState<SelectOptionProps[]>([]);
  const [loadingOption, setLoadingOption]      =  useState(false);
  const [activeOption, setActiveOption]        =  useState(0);
  const [showOption, setShowOption]            =  useState(false);
  const [keyword, setKeyword]                  =  useState("");
  const [keywordSearch]                        =  useLazySearch(keyword);

  const creatableKey = typeof creatable === "string" ? (creatable || "name") : (creatable ? "name" : null);
  const [isCreatingNew, setIsCreatingNew]      =  useState(false);
  const [customText, setCustomText]            =  useState("");
  const [dropdownCustomText, setDropdownCustomText] = useState("");
  const isFocusingCreatable = useRef(false);

  const handleCreateNewSubmit = () => {
    if (!dropdownCustomText.trim() || !creatableKey) return;

    isFocusingCreatable.current = false;
    const valText = dropdownCustomText.trim();
    setIsCreatingNew(true);
    setCustomText(valText);
    setInputShowValue(valText);
    setShowOption(false);
    setFilteredOptions([]);

    const objVal = { [creatableKey]: valText };
    inputHandler.setValue(objVal);
    inputHandler.setIdle(false);
    onChange?.(objVal);
  };

  // =========================>
  // ## Initial
  // =========================>
  const inputHandler  =  useInputHandler(name, value, validations, register, false, unregister)
  const randomId      =  useInputRandomId()


  // =========================>
  // ## Invalid handler
  // =========================>
  const [invalidMessage]  =  useValidation(inputHandler.value, validations, invalid, inputHandler.idle);


  // =========================>
  // ## options handler
  // =========================>
  const optionsKey = typeof options === "object" ? JSON.stringify(options) : String(options || "");
  const includedOptionsKey = typeof includedOptions === "object" ? JSON.stringify(includedOptions) : String(includedOptions || "");
  const exceptOptionsKey = typeof exceptOptions === "object" ? JSON.stringify(exceptOptions) : String(exceptOptions || "");

  useEffect(() => {
    let base = options?.length ? [...options, ...includedOptions] : [...includedOptions];
    if (exceptOptions?.length) {
      base = base.filter((op: SelectOptionProps) => !exceptOptions.includes(op.value));
    }
    setDataOptions(base);
  }, [optionsKey, includedOptionsKey, exceptOptionsKey]);

  const dataOptionsKey = dataOptions.map((op) => String(op.value)).join("|");

  // =========================>
  // ## change value handler
  // =========================>
  useEffect(() => {
    const currentVal = inputHandler.value;
    if (currentVal && typeof currentVal === "object" && !Array.isArray(currentVal) && creatableKey && creatableKey in currentVal) {
      setIsCreatingNew(true);
      const text = String((currentVal as Record<string, any>)[creatableKey] || "");
      setCustomText(text);
      setInputShowValue(text);
    } else if (currentVal !== undefined && currentVal !== null && currentVal !== "" && typeof currentVal !== "object") {
      setIsCreatingNew(false);
      const matched = (newOption ? [newOption, ...dataOptions] : dataOptions)?.find((option) => option.value == currentVal);
      setInputShowValue(matched?.label || currentVal);
    } else if (!currentVal && !isCreatingNew) {
      setInputShowValue("");
    }
  }, [inputHandler.value, dataOptionsKey, creatableKey]);


  const filterOption = (e: any) => {
    if (dataOptions?.length || creatableKey) {
      let newFilteredOptions: SelectOptionProps[] = [];

      if (searchable && !serverSearchable && dataOptions?.length) {
        if (e.target.value) {
          newFilteredOptions = dataOptions.filter((Option) => (Option.label as string)?.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1).slice(0, maxShowOption);
        } else {
          newFilteredOptions = dataOptions.slice(0, maxShowOption);
        }
      } else {
        newFilteredOptions = dataOptions || [];
      }

      setActiveOption(-1);
      setFilteredOptions(newFilteredOptions);
      setShowOption(true);
    }
  };


  const onKeyDownOption = (e: any) => {
    if (dataOptions?.length) {
      if (e.keyCode === 13) {
        const resultValue = filteredOptions?.at(activeOption);
        setActiveOption(-1);
        setFilteredOptions([]);
        setShowOption(false);

        if (resultValue?.value === "__CREATE_NEW__" && creatableKey) {
          setIsCreatingNew(true);
          setCustomText("");
          setInputShowValue("");
          const objVal = { [creatableKey]: "" };
          inputHandler.setValue(objVal);
          onChange?.(objVal, resultValue);
          e.preventDefault();
          return;
        }

        if (!multiple) {
          setInputShowValue(resultValue?.label || inputShowValue);
          inputHandler.setValue(resultValue?.value || inputShowValue);
          serverSearchable && setKeyword((resultValue?.label as string) || keyword);
        } else {
          if (resultValue?.value) {
            searchable ? setInputShowValue(resultValue.label) : searchable && setInputShowValue("");
            serverSearchable && setKeyword(resultValue.label as string);

            const values: string[] = Array.isArray(inputHandler.value) ? Array().concat(inputHandler.value)?.filter((val: string | number) => val != resultValue?.value) : [];

            if (values.find((val) => val == resultValue?.value)) {
              inputHandler.setValue(values);
            } else {
              inputHandler.setValue([...Array().concat(values), resultValue.value]);
            }
          }
        }
        e.preventDefault();
      } else if (e.keyCode === 38) {
        if (activeOption === 0) return;
        setActiveOption(activeOption - 1);
      } else if (e.keyCode === 40) {
        if (activeOption + 1 >= (filteredOptions?.length || 0)) return;
        setActiveOption(activeOption + 1);
      }
    }
  };

  const fetchOptions = async () => {
    setLoadingOption(true);

    const serverControl = {
      ...serverOptionControl,
      params: serverSearchable ? { search: keywordSearch, ...(serverOptionControl?.params || {}) } : (serverOptionControl?.params || {}),
      headers: { "X-Option": 1 }
    };

    const getCacheOptions = await cavity.get(serverOptionControl?.cacheName || `option_${serverOptionControl?.path}`)
    const cacheOptions = (getCacheOptions?.data || []) as SelectOptionProps[];
    
    if (cacheOptions?.length) {
      setDataOptions(
        [...cacheOptions, ...includedOptions].filter(
          (op: SelectOptionProps) => !exceptOptions?.includes(op.value)
        )
      );
      setLoadingOption(false);
    } else {
      const mutateOptions = await api(serverControl || {});
      setDataOptions(
        [...(mutateOptions?.data?.data || []), ...(includedOptions || [])].filter(
          (op: SelectOptionProps) => !exceptOptions?.includes(op.value)
        )
      );
      setShowOption(true);

      if(serverOptionControl?.cacheName != false) {
        cavity.set({
          key: serverOptionControl?.cacheName || `option_${serverOptionControl?.path}`,
          data: mutateOptions?.data,
          expired: 5,
        });
      }
      setLoadingOption(false);
    }
  };

  const fetchIdbOptions = async () => {
    setLoadingOption(true);
    
    if (idbOptionControl?.store) {
      const idb = registry.get("idb");
      if (!idb) {
        throw new Error("IndexedDB (IDB) extension is not installed.");
      }
      const getIdbOptions = await (await idb.query(idbOptionControl?.store)).get()

      const rows = getIdbOptions.map((row: Record<string,any>) => {
        const value = row[idbOptionControl.valueKey] || row["id"];
        const label = row[idbOptionControl.labelKey] || row["id"];

        return {
          label,
          value,
          ...row,
        }
      })

      setDataOptions(rows);
      setLoadingOption(false);
    }
  };

  useEffect(() => {
    if (!serverSearchable) {
      if (serverOptionControl?.path || serverOptionControl?.url) {
        fetchOptions();
      } else if (idbOptionControl?.store) {
        fetchIdbOptions();
      } else {
        !options && setDataOptions([]);
      }
    }
    
  }, [serverOptionControl?.path, serverOptionControl?.url]);

  useEffect(() => {
    if (serverSearchable) {
      if (serverOptionControl?.path || serverOptionControl?.url) {
        fetchOptions();
      } else {
        !options && setDataOptions([]);
      }
    }
  }, [keywordSearch, serverOptionControl?.path, serverOptionControl?.url]);

  return (
    <OutsideClickComponent
      onOutsideClick={() => {
        isFocusingCreatable.current = false;
        setShowOption(false);
        inputHandler.setFocus(false);
      }}
    >
      <div className="input-container">
        <label
          htmlFor={randomId}
          className={cn(
            "input-label",
            disabled && "input-label-disabled",
            inputHandler.focus && "input-label-focus",
            invalidMessage && "input-label-error",
            pcn<CT>(className, "label"),
            disabled && pcn<CT>(className, "label", "disabled"),
            inputHandler.focus && pcn<CT>(className, "label", "focus"),
            invalidMessage && pcn<CT>(className, "label", "error")
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
              disabled && pcn<CT>(className, "tip", "disabled")
            )}
          >{tip}</small>
        )}

        <div className="relative">
          {isCreatingNew && typeof inputHandler.value === "object" && inputHandler.value !== null ? (
            Object.entries(inputHandler.value).map(([subK, subV]) => (
              <input
                key={subK}
                type="hidden"
                name={`${name.endsWith("_id") ? name.slice(0, -3) : name}[${subK}]`}
                value={String(subV ?? "")}
              />
            ))
          ) : (
            <input
              type="hidden"
              value={!multiple ? (typeof inputHandler.value === "object" ? JSON.stringify(inputHandler.value) : String(inputHandler.value ?? "")) : Array().concat(inputHandler.value).map((val) => String(val))}
              name={name}
            />
          )}
          {isCreatingNew && (
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-stroke text-sm px-3.5 py-1.5 rounded-lg select-none pointer-events-none z-10 font-normal">
              Baru
            </div>
          )}
          <input
            type="text"
            readOnly={!searchable}
            id={randomId}
            placeholder={!inputHandler.value || (Array.isArray(inputHandler.value) && !inputHandler.value.length) ? placeholder : ""}
            disabled={disabled}
            className={cn(
              "input cursor-pointer",
              leftIcon && "input-with-left-icon",
              rightIcon && "input-with-right-icon",
              isCreatingNew && "pl-[4.8rem]",
              invalidMessage && "input-error",
              pcn<CT>(className, "input"),
              invalidMessage && pcn<CT>(className, "input", "error")
            )}
            value={(useTemp && tempOptions ? tempOptions.at(0)?.label : serverSearchable ? keyword : (isCreatingNew ? customText : inputShowValue)) as string}
            onChange={(e) => {
              setUseTemp(false);
              searchable && setInputShowValue(e.target.value);
              serverSearchable && setKeyword(e.target.value);
              inputHandler.setIdle(false);
              (dataOptions?.length || creatableKey) && filterOption(e);
            }}
            onFocus={(e) => {
              setUseTemp(false);
              inputHandler.setFocus(true);
              onFocus?.();
              (dataOptions?.length || creatableKey) && filterOption(e);
              searchable && e.target.select();
            }}
            onBlur={(e) => {
              setUseTemp(false);
              if (isFocusingCreatable.current) return;

              if (isCreatingNew) {
                setTimeout(() => {
                  if (!isFocusingCreatable.current) {
                    inputHandler.setFocus(false);
                  }
                }, 100);
                onBlur?.();
                return;
              }
              const value = e.target.value;
              const valueOption = dataOptions?.find((option) => (option.label as string)?.toLowerCase() == value?.toLowerCase());

              if (!keydown) {
                if (!multiple) {
                  setTimeout(() => {
                    if (isFocusingCreatable.current) return;
                    if (valueOption?.value) {
                      setInputShowValue(valueOption.label);
                      inputHandler.setValue(valueOption.value);
                      serverSearchable && setKeyword(valueOption.label as string);
                      onChange?.(valueOption.value, valueOption);
                    } else {
                      setInputShowValue("");
                      serverSearchable && setKeyword("");
                      inputHandler.setValue("");
                      onChange?.("");
                    }
                  }, 140);
                } else {
                  setInputShowValue("");
                  serverSearchable && setKeyword("");
                  onChange?.("");
                }
              }

              setTimeout(() => {
                if (!isFocusingCreatable.current) {
                  inputHandler.setFocus(false);
                }
              }, 100);

              onBlur?.();
            }}
            onKeyDown={(e) => {
              dataOptions?.length && onKeyDownOption(e);
            }}
            autoComplete="off"
            autoFocus={autoFocus}
          />


          {(multiple && !searchable || (searchable && !inputHandler.focus)) && (
            <div
              className={cn(
                "select-multiple-values",
                leftIcon ? "select-multiple-values-left-icon" : "select-multiple-values-no-icon"
              )}
              style={{ maxWidth: `calc(100% - ${leftIcon ? "5.2rem" : "3.2rem"})` }}
            >
              <div className="input-values-container">
                {multiple && typeof inputHandler.value != "string" && Array().concat(inputHandler.value)?.map((item, key) => {
                  return (
                    <div key={key} className="input-values-item">
                      <span>{dataOptions?.find((option) => option.value == item)?.label}</span>
                      <Icon
                        icon="solid/times"
                        className="input-values-delete"
                        onClick={() => {
                          const values = Array().concat(inputHandler.value);
                          const index = values.findIndex((val: string | number) => val == item);

                          inputHandler.setValue(values.filter((_, val) => val != index));

                          if (!values.filter((_, val) => val != index)?.length) {
                            setInputShowValue("");
                            serverSearchable && setKeyword("");
                            onChange?.("");
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {leftIcon && (
            <Icon
              className={cn(
                "input-icon",
                "input-icon-left",
                disabled && "input-icon-disabled",
                inputHandler.focus && "input-icon-focus",
                pcn<CT>(className, "icon"),
                disabled && pcn<CT>(className, "icon", "disabled"),
                inputHandler.focus && pcn<CT>(className, "icon", "focus")
              )}
              icon={leftIcon}
            />
          )}

          {!multiple && clearable && inputHandler.value && (
            <div
              className={cn(
                "input-icon",
                "input-icon-clear",
                disabled && "input-icon-disabled",
                pcn<CT>(className, "icon"),
                disabled && pcn<CT>(className, "icon", "disabled")
              )}
              onClick={() => {
                setIsCreatingNew(false);
                setCustomText("");
                setDropdownCustomText("");
                setInputShowValue("");
                inputHandler.setValue("");
                onChange?.("");
              }}
            >
              <Icon icon="solid/times" />
            </div>
          )}

          <label
            htmlFor={randomId}
            className={cn(
              "input-icon",
              "input-icon-right",
              "select-icon-dropdown cursor-pointer",
              disabled && "input-icon-disabled",
              pcn<CT>(className, "icon"),
              disabled && pcn<CT>(className, "icon", "disabled")
            )}
            onClick={(e) => {
              (dataOptions?.length || creatableKey) && filterOption(e);
            }}
          >
            <Icon icon="solid/chevron-down" />
          </label>
        </div>

        {(!!dataOptions?.length || creatableKey) && showOption && !loadingOption && (
            <div>
              <ul
                className={cn(
                  "input-suggest-container scroll-sm",
                  inputHandler.focus && "input-suggest-container-active",
                  pcn<CT>(className, "suggest"),
                )}
              >
                {creatableKey && (
                  <li
                    className="p-2 border-b border-stroke flex items-center gap-2 cursor-default bg-white sticky top-0 z-10 mb-2"
                    onMouseDown={(e) => {
                      isFocusingCreatable.current = true;
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <input
                      type="text"
                      className="input flex-1 text-sm py-1.5 px-3 rounded-lg border border-stroke focus:outline-none focus:border-primary placeholder:text-slate-300 text-slate-700 bg-white"
                      placeholder={creatableLabel || "Masukkan pilihan baru..."}
                      value={dropdownCustomText}
                      onMouseDown={(e) => {
                        isFocusingCreatable.current = true;
                        e.stopPropagation();
                      }}
                      onFocus={() => {
                        isFocusingCreatable.current = true;
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          if (!isFocusingCreatable.current) {
                            setShowOption(false);
                            inputHandler.setFocus(false);
                          }
                        }, 200);
                      }}
                      onChange={(e) => setDropdownCustomText(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateNewSubmit();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bg-light-primary text-primary p-2 rounded-lg flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer border-none"
                      onMouseDown={(e) => {
                        isFocusingCreatable.current = true;
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateNewSubmit();
                      }}
                    >
                      <Icon icon="solid/check" className="w-4 h-4" />
                    </button>
                  </li>
                )}

                {(newOption ? [newOption, ...filteredOptions] : filteredOptions).map((option, key) => {
                  const selected = !isCreatingNew && (
                    !!((typeof inputHandler.value == "string" || typeof inputHandler.value == "number") && inputHandler.value == option.value) ||
                    (Array.isArray(inputHandler.value) && Array().concat(inputHandler.value).find((val: string | number) => val == option.value))
                  );

                  return (
                    <li
                      className={cn(
                        "input-suggest",
                        (key == activeOption || selected) && "input-suggest-active",
                        pcn<CT>(className, "suggest-item"),
                        (key == activeOption || selected) && pcn<CT>(className, "suggest-item", "active")
                      )}
                      key={key}
                      onMouseDown={() => {
                        setKeydown(true);
                        setTimeout(() => inputHandler.setFocus(true), 110);
                      }}
                      onMouseUp={() => {
                        setKeydown(false);
                        setActiveOption(key);
                        setFilteredOptions([]);
                        setShowOption(false);

                        setIsCreatingNew(false);

                        if (!multiple) {
                          setInputShowValue(option.label);
                          serverSearchable && setKeyword(option.label as string);
                          inputHandler.setValue(option.value);
                          onChange?.(option.value, option);
                        } else {
                          const values: string[] | number[] = Array.isArray(inputHandler.value) 
                            ? Array().concat(inputHandler.value).filter((val) => val != option.value)
                            : [];                          

                          setInputShowValue("");
                          serverSearchable && setKeyword("");

                          if (
                            Array.isArray(inputHandler.value) && Array().concat(inputHandler.value).find((val) => val == option.value)
                          ) {
                            inputHandler.setValue(values);
                            onChange?.(values);
                          } else {
                            inputHandler.setValue([...Array().concat(values), option.value ]);
                            onChange?.([...Array().concat(values), option.value]);
                          }
                        }
                        setTimeout(() => inputHandler.setFocus(false), 120);
                      }}
                    >
                      {selected && (
                        <Icon
                          icon="solid/check"
                          className="select-suggest-check"
                        />
                      )}
                      {option.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

        {invalidMessage && (
          <small className={cn("input-error-message", pcn<CT>(className, "error"))}>{invalidMessage}</small>
        )}
      </div>
    </OutsideClickComponent>
  );
}
