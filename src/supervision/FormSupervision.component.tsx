"use client"

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ApiType, cn, pcn, FormErrorType, FormRegisterType, FormValueType, useForm, ValidationRules, DBSchema } from "@utils";
import {
  InputCheckboxComponent,
  InputComponent,
  InputCurrencyComponent,
  InputDateComponent,
  InputNumberComponent,
  InputOtpComponent,
  InputPasswordComponent,
  InputRadioComponent,
  SelectComponent,
  ButtonComponent,
  ModalConfirmComponent,
  InputProps,
  InputCheckboxProps,
  InputCurrencyProps,
  InputDateProps,
  InputNumberProps,
  InputRadioProps,
  SelectProps,
  InputPasswordProps,
  InputOtpProps,
  InputTimeProps,
  InputImageProps,
  InputDateTimeProps,
  InputDatetimeComponent,
  InputTimeComponent,
  InputImageComponent,
} from "../";
import { Icon } from "@skalfa/skalfa-icon";
import { useLang } from "@skalfa/skalfa-lang";



type CT = "base" | "title" | "submit";

type formCustomConstructionProps = ({
  formControl,
  values,
  setValues,
  setRegister,
  errors,
  setErrors,
}: {
  formControl  :  (name: string) => {
    register: (regName: string, regValidations?: ValidationRules | undefined) => void;
    onChange: (e: any) => void;
    value: any;
    invalid: any;
  };
  values       :  { name: string; value?: any }[];
  setValues    :  (values: FormValueType[]) => void;
  errors       :  FormErrorType[];
  setErrors    :  (errors: FormErrorType[]) => void;
  setRegister  :  (registers: FormRegisterType) => void;
  prefixName  ?:  string;
}) => ReactNode;

type ClusterConstruction = {
  name            :  string;
  label           :  string;
  tip             :  string;
  fields          :  FormType[];
  wrap            :  boolean;
  min            ?:  number;

  /** Use custom class with: "label::", "tip::", "error::", "icon::", "suggest::", "suggest-item::". */
  className  :  string;
};

type ConstructionMap = {
  default           :  InputProps;
  check             :  InputCheckboxProps;
  currency          :  InputCurrencyProps;
  date              :  InputDateProps;
  datetime          :  InputDateTimeProps;
  time              :  InputTimeProps;
  image             :  InputImageProps;
  cluster           :  ClusterConstruction;
  number            :  InputNumberProps;
  radio             :  InputRadioProps;
  select            :  SelectProps;
  "enter-password"  :  InputPasswordProps;
  otp               :  InputOtpProps;
  custom            :  formCustomConstructionProps;
};

type TypeKeys = keyof ConstructionMap;

export type WatchContext = {
  values  : Record<string, any>
  self    : string
  prev    : WatchAction
}

export type WatchAction = {
  disabled  ?: boolean
  hidden    ?: boolean
  value     ?: any
  required  ?: boolean
  readonly  ?: boolean
  reset     ?: boolean
}

export interface FormType<T extends TypeKeys = keyof ConstructionMap> {
  col           ?:  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | string;
  className     ?:  string;
  construction  ?:  ConstructionMap[T];
  type          ?:  T;
  onHide        ?:  (values: Record<string, any>) => boolean;
  onWatch       ?:  (ctx: WatchContext) => WatchAction | undefined;
}

export interface formSupervisionProps {
  title          ?:  string;
  fields          :  FormType[];
  confirmation   ?:  boolean;
  defaultValue   ?:  object | null;
  payload        ?:  (values: any) => Promise<object> | object;
  submitControl   :  (ApiType & { idb?: never }) | { idb: { store: string, schema?: DBSchema }};
  footerControl  ?:  ({ loading }: { loading: boolean }) => ReactNode;
  onSuccess      ?:  (data: any) => void;
  onError        ?:  (code: number) => void;
  successMessage ?:  string;
  className      ?:  string;
  id             ?:  string;
}



export function FormSupervisionComponent({
  title,
  fields,
  submitControl,
  confirmation,
  defaultValue,
  onSuccess,
  onError,
  footerControl,
  payload,
  className = "",
  successMessage,
  id,
}: formSupervisionProps) {
  const l = useLang();

  const [modal, setModal]            =  useState<boolean | "success" | "failed">(false);
  const [fresh, setFresh]            =  useState<boolean>(true);
  const [mapGroups, setMapGroups]      =  useState<Record<string, number[]>>({});
  const [watchState, setWatchState]    =  useState<Record<string, WatchAction>>({});
  const watchRef                       =  useRef<Record<string, WatchAction>>({});

  const [
    {
      formControl,
      setRegister,
      setUnregister,
      values,
      setValues,
      errors,
      setErrors,
      setDefaultValues,
      submit,
      loading,
      confirm,
    },
  ] = useForm(
    submitControl,
    payload,
    confirmation,
    (data: any) => {
      onSuccess?.(data);
      setModal("success");
      setTimeout(() => setModal(false), 1000);
      resetFresh();
    },
    (code: number) => {
      onError?.(code);
      if (code == 422) confirm.onClose();
      else setModal("failed");
    }
  );

  // ==============================>
  // ## Watch: collect watchers from fields
  // ==============================>
  const collectWatchers = (fieldList: FormType[], prefix?: string): { name: string, onWatch: NonNullable<FormType['onWatch']>, construction: any }[] => {
    const result: { name: string, onWatch: NonNullable<FormType['onWatch']>, construction: any }[] = [];

    for (const f of fieldList) {
      const inputType = f.type || "default";
      const name      = prefix ? `${prefix}.${f.construction?.name}` : f.construction?.name || "";

      if (inputType === "cluster") {
        const cluster   = f.construction as ClusterConstruction;
        const groupKey  = prefix ? `${prefix}.${cluster.name}` : cluster.name;
        const group     = mapGroups[groupKey] || [];

        for (const gIndex of group) {
          result.push(...collectWatchers(cluster.fields, `${cluster.name}[${gIndex}]`));
        }
      } else if (f.onWatch) {
        result.push({ name, onWatch: f.onWatch, construction: f.construction });
      }
    }

    return result;
  };

  // ==============================>
  // ## Watch: execute watchers on value change
  // ==============================>
  useEffect(() => {
    const watchers = collectWatchers(fields);
    if (watchers.length === 0) {
      if (Object.keys(watchRef.current).length > 0) {
        watchRef.current = {};
        setWatchState({});
      }
      return;
    }

    const valMap: Record<string, any> = {};
    values.forEach((v) => { valMap[v.name] = v.value; });

    const nextState    : Record<string, WatchAction> = {};
    const valueUpdates : FormValueType[] = [];

    for (const { name, onWatch, construction } of watchers) {
      const prev   = watchRef.current[name] || {};
      const action = onWatch({ values: valMap, self: name, prev });

      if (!action) continue;

      nextState[name] = action;

      if (action.hidden && !prev.hidden) setUnregister(name);

      if (action.required !== prev.required) {
        const baseValidations = Array.isArray(construction?.validations) ? [...construction.validations] : [];
        const newValidations  = action.required ? (baseValidations.includes("required") ? baseValidations : [...baseValidations, "required"]) : baseValidations.filter((v: string) => v !== "required");

        setRegister({ name, validations: newValidations });
      }

      if (action.reset) {
        const cur = valMap[name];

        if (cur != null && cur !== "") valueUpdates.push({ name, value: "" });
      } else if (action.value !== undefined && action.value !== valMap[name]) {
        valueUpdates.push({ name, value: action.value });
      }
    }

    if (JSON.stringify(watchRef.current) !== JSON.stringify(nextState)) {
      watchRef.current = nextState;
      setWatchState(nextState);
    }

    if (valueUpdates.length > 0) {
      const merged = [...values];

      for (const upd of valueUpdates) {
        const idx = merged.findIndex(v => v.name === upd.name);
        if (idx >= 0) merged[idx] = upd;
        else merged.push(upd);
      }

      setValues(merged);
    }
  }, [values, fields, mapGroups]);

  const GroupsFromDefaults = (defaults: Record<string, any>): Record<string, number[]> => {
    const groups: Record<string, Set<number>> = {};

    Object.keys(defaults).forEach((key) => {
      const match = key.match(/^(.+?)\[(\d+)\]/);
      if (!match) return;

      const [, groupKey, indexStr] = match;
      const index = Number(indexStr);

      if (!groups[groupKey]) {
        groups[groupKey] = new Set();
      }

      groups[groupKey].add(index);
    });

    return Object.fromEntries(
      Object.entries(groups).map(([key, indexSet]) => [
        key,
        Array.from(indexSet)
          .sort((a, b) => a - b)
          .map((_, i) => i),
      ])
    );
  };

  const resetFresh = () => {
    setFresh(false);
    setTimeout(() => setFresh(true), 300);
  };

  useEffect(() => {
    resetFresh();
  }, [fields]);

  useEffect(() => {
    const minGroups: Record<string, number[]> = {};
    const initialValues: FormValueType[] = [];

    const processMinClusters = (formList: FormType[], prefix?: string) => {
      formList.forEach((form) => {
        if (form.type === "cluster" && form.construction) {
          const { name: mapName, fields: innerForms, min } = form.construction as ClusterConstruction;
          const groupKey = prefix ? `${prefix}.${mapName}` : mapName;
          const minCount = Math.max(0, min || 0);

          if (minCount > 0) {
            minGroups[groupKey] = Array.from({ length: minCount }, (_, i) => i);

            for (let gIndex = 0; gIndex < minCount; gIndex++) {
              innerForms.forEach((inner) => {
                const fieldName = `${groupKey}[${gIndex}].${inner.construction?.name}`;
                initialValues.push({ name: fieldName, value: "" });
              });
            }
          }
        }
      });
    };

    processMinClusters(fields);

    if (defaultValue) {
      setDefaultValues(defaultValue);
      const derivedGroups = GroupsFromDefaults(defaultValue);
      setMapGroups({ ...minGroups, ...derivedGroups });
      resetFresh();
    } else {
      setDefaultValues(null);
      setMapGroups(minGroups);
      if (initialValues.length > 0) {
        setValues(initialValues);
      }
      resetFresh();
    }
  }, [defaultValue, fields]);

  const generateColClass = (col: string | number) => String(col).split(" ").map((c) => (c.includes(":") ? `${c.replace(":", ":col-span-")}` : `col-span-${c}`)).join(" ");

  const inputMap: Record<TypeKeys, React.FC<any>> = {
    default           :  InputComponent,
    check             :  InputCheckboxComponent,
    currency          :  InputCurrencyComponent,
    date              :  InputDateComponent,
    datetime          :  InputDatetimeComponent,
    time              :  InputTimeComponent,
    number            :  InputNumberComponent,
    radio             :  InputRadioComponent,
    select            :  SelectComponent,
    "enter-password"  :  InputPasswordComponent,
    otp               :  InputOtpComponent,
    image             :  InputImageComponent,
    cluster           :  () => null,
    custom            :  () => null,
  };

  const renderInput = (form: FormType, key: number, prefix?: string) => {
    const inputType = form.type || "default";
    const name = prefix ? `${prefix}.${form.construction?.name}` : form.construction?.name || "input_name";

    const valMap: Record<string, any> = {};
    values.forEach((v) => { valMap[v.name] = v.value; });

    if (form?.onHide?.(valMap)) return null;

    const ws = watchState[name];
    if (ws?.hidden) return null;

    if (inputType === "cluster") {
      const { name: mapName, fields: innerForms, label, tip, wrap, className, min } = form.construction as ClusterConstruction;
      const minCount = Math.max(0, min || 0);

      const groupKey = prefix ? `${prefix}.${mapName}` : mapName;
      const defaultGroup = minCount > 0 ? Array.from({ length: minCount }, (_, i) => i) : [];
      const group = mapGroups[groupKey] ?? defaultGroup;

      const showDeleteButton = group.length > minCount;

      const addGroup = () => {
        const nextIndex = group.length;
        setMapGroups((prev) => ({ ...prev, [groupKey]: [...group, nextIndex] }));

        const newGroupValues = innerForms.map((inner) => ({
          name: `${groupKey}[${nextIndex}].${inner.construction?.name}`,
          value: "",
        }));

        setValues([...values, ...newGroupValues]);
      };

      const removeGroup = (index: number) => {
        const filteredGroup = group.filter((_, i) => i !== index);
        const newGroup = filteredGroup.map((_, i) => i);

        setMapGroups((prev) => ({ ...prev, [groupKey]: newGroup }));

        let updatedValues = values.filter((v) => {
          const n = String(v?.name || "");
          if (!n) return true;
          if (n.startsWith(`${groupKey}[${index}]`) || n.startsWith(`${groupKey}.${index}.`)) return false;
          return true;
        });

        const regex = new RegExp(`${groupKey}\\[(\\d+)\\]`, 'g');
        updatedValues = updatedValues.map((v) => {
          let name = v.name;
          name = name.replace(regex, (match: string, oldIdx: string) => {
            const oldIndex = parseInt(oldIdx, 10);
            const newIndex = newGroup.indexOf(oldIndex);
            return newIndex >= 0 ? `${groupKey}[${newIndex}]` : match;
          });
          return { ...v, name };
        });

        setValues(updatedValues);
      };

      const clusterError = errors?.find((err: FormErrorType) => err.name === groupKey || err.name === mapName)?.error;

      return (
        <div key={key} className={cn("flex flex-col gap-4", generateColClass(form.col || "12"))}>
          {label && <p className="input-label">{label}</p>}
          {clusterError && <small className="input-error-message">{clusterError}</small>}
          {group.map((gIndex) => (
            <div key={gIndex} className={cn("relative pr-8", wrap && "p-4 rounded border", className)}>
              {label && <p className="input-label">{label} {gIndex + 1}</p>}
              {tip && <small className={cn("input-tip")}>{tip}</small>}
              {(label || tip) && <div className="mb-2"></div>}

              <div className="w-full grid grid-cols-12 gap-4">
                {innerForms.map((inner, i) => renderInput(inner, i, `${groupKey}[${gIndex}]`))}
              </div>

              {showDeleteButton && (
                <ButtonComponent
                  icon={"solid/times"}
                  paint="danger"
                  variant="outline"
                  size="xs"
                  className={cn("absolute top-10 right-2 translate-x-[50%] -translate-y-[50%]", wrap && "translate-x-0 -translate-y-0 top-1 right-1")}
                  onClick={() => removeGroup(gIndex)}
                />
              )}
            </div>
          ))}

          <div>
            <ButtonComponent
              icon={"solid/plus"}
              label={`${l.base.add ? l.base.add() : "Add"} ${label || mapName}`}
              variant="outline"
              size="sm"
              onClick={addGroup}
            />
          </div>
        </div>
      );
    }

    if (inputType === "custom") {
      const customRender = form.construction as formCustomConstructionProps;
      return (
        <div key={key} className={cn(form.className, generateColClass(form.col || "12"))}>
          {customRender?.({ formControl, values, setValues, errors, setErrors, setRegister, prefixName: prefix })}
        </div>
      );
    }

    const Component = inputMap[inputType] || InputComponent;
    return (
      <div key={key} className={cn(form.className, generateColClass(form.col || "12"))}>
        <Component
          {...(form.construction as any)}
          {...formControl(name)}
          disabled={ws?.disabled}
          readOnly={ws?.readonly}
          name={name}
        />
      </div>
    );
  };

  useEffect(() => {
    (modal == "failed") &&  setModal(false)
  }, [values]);

  return (
    <>
      {title && <h4 className={cn("text-lg font-semibold mb-4", pcn<CT>(className, "title"))}>{title}</h4>}

      {modal == "success" ? (
        <div className="flex flex-col items-center justify-center h-full py-6 transition-all duration-300 animate-intro-down">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon icon={"solid/check"} className="text-primary text-2xl" />
          </div>
          <p className="text-primary text-lg font-semibold mt-4 mb-12">{successMessage || l.base?.success ? l.base.success() : "Success!"}</p>
        </div>
      ) : (
        <form id={id} className={cn("flex flex-col h-full pb-8")} onSubmit={submit}>
          <div className={cn("grid grid-cols-12 gap-4 flex-1 content-start", pcn<CT>(className, "base"))}>
            {fresh && fields.map((f, i) => renderInput(f, i))}

            {!footerControl && (
              <div className="hidden md:block col-span-12">
                <div className="flex justify-end mt-4">
                  <ButtonComponent
                    type="submit"
                    label={l.base?.save ? l.base.save() : "Save"}
                    icon={"solid/save"}
                    loading={loading}
                    className={pcn<CT>(className, "submit")}
                  />
                </div>
              </div>
            )}

            {!footerControl && (
              <div className={"md:hidden col-span-12 mt-4"}>
                <ButtonComponent
                  label={l.base?.save ? l.base.save() : "Save"}
                  icon={"solid/save"}
                  type="submit"
                  loading={loading}
                  block
                  className={pcn<CT>(className, "submit")}
                />
              </div>
            )}
            
            {footerControl && (
              <div className="col-span-12">{footerControl?.({ loading })}</div>
            )}

            {modal == "failed" && (
              <div className="col-span-12 mt-4 w-full p-4 rounded-sm border border-danger bg-light-danger flex gap-4 items-center">
                <div>
                  <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                    <Icon icon={"solid/exclamation-triangle"} className="text-danger text-lg" />
                  </div>
                </div>
                <p className="text-danger text-sm font-semibold">{l.base.formFailed ? l.base.formFailed() : "Failed to save data, please check your data and internet connection then try again!"}</p>
              </div>
            )}
          </div>
        </form>
      )}

      <ModalConfirmComponent
        show={confirm.show}
        onClose={() => confirm.onClose()}
        title={l.base?.formConfirm ? l.base.formConfirm() : "Are you sure all data is correct?"}
        submitControl={{ onSubmit: () => confirm?.onConfirm(), paint: "primary" }}
      />
    </>
  );
}