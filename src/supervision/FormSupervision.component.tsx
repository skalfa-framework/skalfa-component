"use client"

import React, { ReactNode, useEffect, useState } from "react";
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

export interface FormType<T extends TypeKeys = keyof ConstructionMap> {
  col           ?:  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | string;
  className     ?:  string;
  construction  ?:  ConstructionMap[T];
  type          ?:  T;
  onHide        ?:  (values: any) => boolean;
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

  const [modal, setModal]          =  useState<boolean | "success" | "failed">(false);
  const [fresh, setFresh]          =  useState<boolean>(true);
  const [mapGroups, setMapGroups]  =  useState<Record<string, number[]>>({});

  const [
    {
      formControl,
      setRegister,
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
  if (defaultValue) {
    setDefaultValues(defaultValue);

    const derivedGroups = GroupsFromDefaults(defaultValue);
    setMapGroups(derivedGroups);

    resetFresh();
  } else {
    setDefaultValues(null);
    setMapGroups({});
    resetFresh();
  }
}, [defaultValue]);

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

    if (form?.onHide?.(values)) return null;

    if (inputType === "cluster") {
      const { name: mapName, fields: innerForms, label, tip, wrap, className } = form.construction as ClusterConstruction;

      const groupKey = prefix ? `${prefix}.${mapName}` : mapName;
      const group = mapGroups[groupKey] || [0];

      const addGroup = () => setMapGroups((prev) => ({ ...prev, [groupKey]: [...group, group.length] }));

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

      return (
        <div key={key} className={cn("flex flex-col gap-4", generateColClass(form.col || "12"))}>
          {group.map((gIndex) => (
            <div key={gIndex} className={cn("relative pr-8", wrap && "p-4 rounded border", className)}>
              {label && <p className="input-label">{label} {gIndex + 1}</p>}
              {tip && <small className={cn("input-tip")}>{tip}</small>}
              {(label || tip) && <div className="mb-2"></div>}

              <div className="w-full grid grid-cols-12 gap-4">
                {innerForms.map((inner, i) => renderInput(inner, i, `${mapName}[${gIndex}]`))}
              </div>

              <ButtonComponent
                icon={"solid/times"}
                paint="danger"
                variant="outline"
                size="xs"
                className={cn("absolute top-10 right-2 translate-x-[50%] -translate-y-[50%]", wrap && "translate-x-0 -translate-y-0 top-1 right-1")}
                onClick={() => removeGroup(gIndex)}
              />
            </div>
          ))}

          <div>
            <ButtonComponent
              icon={"solid/plus"}
              label={`Tambah ${label || mapName}`}
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
          // autoFocus={key === 0}
        />
      </div>
    );
  };

  return (
    <>
      {title && <h4 className={cn("text-lg font-semibold mb-4", pcn<CT>(className, "title"))}>{title}</h4>}

      {modal == "success" ? (
        <div className="flex flex-col items-center justify-center h-full py-6 transition-all duration-300 animate-intro-down">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Icon icon={"solid/check"} className="text-primary text-2xl" />
          </div>
          <p className="text-primary text-lg font-semibold mt-4">{successMessage || "Berhasil disimpan!"}</p>
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
              <div className="mt-4 w-full p-4 rounded-sm border border-danger bg-light-danger flex gap-4 items-center">
                <div>
                  <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center">
                    <Icon icon={"solid/exclamation-triangle"} className="text-danger text-lg" />
                  </div>
                </div>
                <p className="text-danger text-sm font-semibold">{"Terjadi Masalah, Coba ulangi lagi!"}</p>
              </div>
            )}
          </div>
        </form>
      )}

      <ModalConfirmComponent
        show={confirm.show}
        onClose={() => confirm.onClose()}
        title={l.base?.confirmTitle ? l.base.confirmTitle() : "Yakin"}
        submitControl={{ onSubmit: () => confirm?.onConfirm(), paint: "primary" }}
      />
    </>
  );
}