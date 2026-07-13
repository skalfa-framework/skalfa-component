"use client"

import { ReactNode, useEffect, useMemo } from "react";
import { ApiType, cn, conversion, registry, shortcut, ShortcutHandler, UseResourceIdb, UseResourceProps, useResponsive, useTable } from "@utils";
import { useToggleContext } from "@contexts";
import { FloatingPageComponent, FloatingPageProps, ButtonComponent, TableColumnType, TableComponent, FormSupervisionComponent, FormType, ModalConfirmComponent, TypographyColumnComponent, ButtonProps, ModalConfirmProps, TableProps, ControlBarOptionType, SwipeActionType, BottomSheetProps } from "../";
import { useLang } from "@skalfa/skalfa-lang";

const ExportExcel = registry.get("ExportExcel");
const ImportExcel = registry.get("ImportExcel");


export interface TableSupervisionColumnProps {
  selector     :  string;
  label       ?:  string;
  width       ?:  string;
  sortable    ?:  boolean;
  searchable  ?:  boolean;
  filterable  ?:  boolean | {
    type       :  "text" | "number" | "currency" | "date";
  } | {
    type       :  "select";
    options    :   { label: string; value: any }[];
  };
  accessCode  ?:  string;
  item        ?:  (data: any) => string | ReactNode;
  tip         ?:  string | ((data: any) => string);
};

export interface TableSupervisionFormProps {
  fields                :  string[] | (FormType & { visibility?: "*" | "create" | "update" })[];
  defaultValue        ?:  (item: Record<string, any> | null) => Promise<Record<string, any>> | Record<string, any>;
  payload             ?:  (values: any) => Promise<Record<string, any>> | object;
  modalControl        ?:  Omit<FloatingPageProps, "show" | "onClose" | "children"> | Omit<BottomSheetProps, "show" | "onClose" | "children">;
  contentType         ?:  "application/json" | "multipart/form-data";
};

export type TableSupervisionDetailProps = boolean 
    | (
      | string 
      | { label: string, item: string | ((data: Record<string, any>) => ReactNode), conversion?: keyof typeof conversion }
      | ((data: Record<string, any>) => ReactNode)
    )[] 
    | ((data: Record<string, any>) => ReactNode);

export type TableSupervisionProps = {
  fetchControl     :  UseResourceProps;
  title           ?:  string;
  id              ?:  string;
  accessCode      ?:  number;
  urlParam        ?:  boolean | { compressed    ?:  boolean }
  onRowClick      ?:  (data: Record<string, any>) => void;
  columnControl   ?:  string[] | TableSupervisionColumnProps[];
  formControl     ?:  TableSupervisionFormProps;
  detailControl   ?:  TableSupervisionDetailProps;
  actionControl   ?:  boolean | (
    | 'EDIT' | 'DELETE' | {
      label           :  string,
      modal          ?:  ModalConfirmProps,
      button         ?:  ButtonProps,
      shortcut       ?:  { key: string, description: string },
    } | ((
      row              :  object,
      setModal        ?:  (type: "EDIT" | "DELETE") => void,
      setDataSelected ?:  () => void,
      setShortcut     ?:  (key: string, handler: ShortcutHandler, description?: string) => void,
      size            ?:  string,
    ) => ReactNode)
  )[];
  block                ?:  boolean,
  noIndex              ?: boolean;
  actionBulkingControl ?:  TableProps["actionBulking"],
  controlBar           ?:  (ControlBarOptionType | "CREATE" | "IMPORT" | "EXPORT" | "PRINT")[];
  responsiveControl    ?:  {
    mobile                 ?:  boolean | {
      item                 ?:  (item: Record<string, any>, key: number) => ReactNode,
      leftActionControl    ?:  Omit<SwipeActionType, "onAction"> & { onAction?: (item: Record<string, any>, key?: number) => void },
      rightActionControl   ?:  Omit<SwipeActionType, "onAction"> & { onAction?: (item: Record<string, any>, key?: number) => void },
    }
  }
};



export function TableSupervisionComponent({
  title,
  id,
  fetchControl,
  columnControl,
  formControl,
  onRowClick,
  detailControl,
  actionControl,
  actionBulkingControl,
  block,
  controlBar,
  noIndex,
  responsiveControl,
  urlParam,
}: TableSupervisionProps) {
  const l = useLang();

  const { tableKey, tableControl, data, selected, setSelected, checks, setChecks, reset, focus, setFocus }  =  useTable(fetchControl, id, title, (urlParam || true))
  const { setToggle, toggle }                                                                               =  useToggleContext()
  const { isSm }                                                                                            =  useResponsive();

  const toggleKey = useMemo(() => conversion.strSnake(tableKey).toUpperCase(), [tableKey])


  useEffect(() => {
    if(data?.data?.length && !toggle[`MODAL_DELETE_${toggleKey}`] && !toggle[`MODAL_DELETE_${toggleKey}`] && !toggle[`MODAL_SHOW_${toggleKey}`]) {
      shortcut.register("arrowdown", () => {
        const max = data?.data?.length - 1;
        setFocus(focus == null ? 0 : focus >= max ? max : (focus + 1))
      }, l.base.shortcutDown ? l.base.shortcutDown() : "")

      shortcut.register("arrowup", () => {
        setFocus(focus == null ? 0 : focus <= 0 ? 0 : (focus - 1))
      }, l.base.shortcutUp ? l.base.shortcutUp() : "")

      if(focus != null) {
        shortcut.register("delete", () => {
          setSelected(data?.data?.at(focus))
          setToggle(`MODAL_DELETE_${toggleKey}`)
        }, l.base.shortcutDelete ? l.base.shortcutDelete() : "")

        shortcut.register(" ", () => {
          setSelected(data?.data?.at(focus))
          setToggle(`MODAL_FORM_${toggleKey}`)
        }, l.base.shortcutEdit ? l.base.shortcutEdit() : "")
  
        shortcut.register("enter", () => {
          setSelected(data?.data?.at(focus))
          setToggle(`MODAL_SHOW_${toggleKey}`)
        }, l.base.shortcutDetail ? l.base.shortcutDetail() : "")

        shortcut.register("escape", () => {
          setFocus(null)
        }, l.base.shortcutBack ? l.base.shortcutBack() : "")
      }
    }

    return () => {
      shortcut.unregister("arrowdown")
      shortcut.unregister("arrowup")
      shortcut.unregister("delete")
      shortcut.unregister(" ")
      shortcut.unregister("enter")
      shortcut.unregister("escape")
    }
  }, [data?.data, actionControl, focus, toggle[`MODAL_DELETE_${toggleKey}`], toggle[`MODAL_DELETE_${toggleKey}`], toggle[`MODAL_SHOW_${toggleKey}`]])
  

  // ============================
  // ## Column preparation
  // ============================
  const columns = useMemo(() => {
    return columnControl?.length ? columnControl.map((col) => {
      if (typeof col === "string") {
        return {
          selector  :  col,
          label     :  col,
        };
      } else {
        return { ...col };
      }
    })
  : data?.columns || data?.data?.at(0) ? Object.keys(data.data[0]).map((col) => {
      return {
        selector  :  col,
        label     :  col,
      };
    })
  : [];
  }, [columnControl, data]);



  const renderTableAction = (
    actions             :  TableSupervisionProps["actionControl"],
    item               ?:  Record<string,                          any>,
    options            ?:  {size?: ButtonProps['size'], className?: string}
  ) => {
    return (
      <>
        <div className={cn("flex items-center gap-2", options?.className)}>
          {(Array.isArray(actions) ? actions : (actions || actions == undefined) ? ['EDIT', "DELETE"] : [])?.map((action, key) => {
            if(action == "EDIT") {
              return (
                <ButtonComponent
                  key={key}
                  icon={"solid/edit"}
                  label={l.base.edit ? l.base.edit() : "Edit"}
                  variant="outline"
                  paint="warning"
                  size={options?.size || "xs"}
                  rounded
                  onClick={() => {
                    setToggle(`MODAL_FORM_${toggleKey}`);
                    item && setSelected?.(item);
                  }}
                />
              )
            }

            if(action == "DELETE") {
              return (
                <ButtonComponent
                  key={key}
                  icon={"solid/trash"}
                  label={l.base.delete ? l.base.delete() : "Delete"}
                  variant="outline"
                  paint="danger"
                  size={options?.size || "xs"}
                  rounded
                  onClick={() => {
                    setToggle(`MODAL_DELETE_${toggleKey}`);
                    item && setSelected?.(item);
                  }}
                />
              )
            }

            if(typeof action == "object") {
              return (
                <>
                  <ButtonComponent
                    key={`action-object-${key}`}
                    label={action?.button?.label || action?.label}
                    variant={action?.button?.variant || "outline"}
                    paint={action?.button?.paint || "primary"}
                    size={action?.button?.size || options?.size || "xs"}
                    rounded={action?.button?.rounded || true}
                    className={action?.button?.className}
                    onClick={() => {
                      if (action?.button?.onClick) {
                        action?.button?.onClick(item)
                      } else {
                        setToggle(`MODAL_${conversion.strSnake(action?.label).toUpperCase()}_${toggleKey}`);
                        item && setSelected?.(item);
                      }
                    }}
                  />
                  {...action.button}
                </>
              )
            }

            if(typeof action == "function") {
              return (
                <span key={`action-fn-${key}`}>
                  {action(item || {}, (type: "EDIT" | "DELETE") => {
                    if(type == "EDIT") {
                      setToggle(`MODAL_FORM_${toggleKey}`);
                      item && setSelected?.(item);
                    } 
                    
                    if (type == "DELETE") {
                      setToggle(`MODAL_DELETE_${toggleKey}`);
                      item && setSelected?.(item);
                    }
                  }, () => item && setSelected?.(item), () => {}, options?.size)}
                </span>
              )
            }
            
            return <span key={`action-default-${key}`}></span>;
          })}
        </div>
      </>
    )
  }


  // ============================
  // ## Data table preparation
  // ============================
  const dataTables = useMemo(() => {
    return data?.data?.map((row: object) => {
      return {
        ...row,
        action: renderTableAction(actionControl, row),
      };
    });
  }, [actionControl, data]);


  // ============================
  // ## Render detail page 
  // ============================
  const detailPage = useMemo(() => {
    if (!toggle[`MODAL_SHOW_${toggleKey}`]) return null;
    return (
      <div className="p-4">
        <div className={cn(
          "flex flex-col gap-y-4", 
        )}>
          {!!selected && (typeof detailControl === "object" && detailControl?.length ? detailControl?.map((column, key) => {
            if (typeof column === "string") {
              return (<TypographyColumnComponent
                key={key}
                title={columns?.find((c) => c.selector == column)?.label} 
                content={selected[column]}
              />)
            } else if (typeof column === "object") {
              return (<TypographyColumnComponent
                key={key}
                title={column?.label} 
                content={typeof column?.item === "string" ? selected[column?.item] : column?.item(selected)}
              />)
            } else {
              return column?.(selected)
            }
          }) : typeof detailControl == "function" ?  detailControl(selected) : columns?.map((column, key) => (
            <TypographyColumnComponent
              key={key}
              title={column.label} 
              content={selected[column.selector]}
            />
          )))}
        </div>
      </div>
    )
  }, [selected, detailControl]);




  // ============================
  // ## Form preparation
  // ============================
  const fields = useMemo(() => {
    return formControl?.fields?.length ? formControl?.fields.map((form) => {
      return typeof form === "string" ? {
        col           :  12,
        type          :  "text",
        construction  :  {
          name   :  form,
          label  :  form,
        },
      } : { ...form };
    }) : data?.forms || data?.columns || columnControl?.map((col) => {
      return {
        col           :  12,
        type          :  "text",
        construction  :  {
          name         :  typeof col == "string" ? col : col?.selector,
          label        :  typeof col == "string" ? col : col?.label,
          placeholder  :  l.base.inputPlaceholder ? l.base.inputPlaceholder(`${ typeof col == "string" ? col : col?.label}`) : `Enter ${ typeof col == "string" ? col : col?.label}...`,
        },
      };
    }) || (data?.data?.at(0) ? Object.keys(data.data[0]).map((col) => {
        return {
          col           :  12,
          type          :  "text",
          construction  :  {
            name         :  col,
            label        :  col,
            placeholder  :  l.base.inputPlaceholder ? l.base.inputPlaceholder(col) : `Enter ${col}...`,
          },
        };
      })
    : []);
  }, [formControl, data]);



  // ============================
  // ## Render form page 
  // ============================
  const formPage = useMemo(async () => {
    return (
      <FormSupervisionComponent
        submitControl={(fetchControl as ApiType).path ? { 
            path    :  `${(fetchControl as ApiType).path}/${(selected as { id: number })?.id || "" }`,
            method  :  !(selected as { id: number })?.id ? "POST"                                      :  "PUT",
          }  :  (fetchControl as ApiType).url ? { 
            url     :  `${(fetchControl as ApiType).url}/${(selected as { id: number })?.id || ""}`,
            method  :  !(selected as { id: number })?.id ? "POST"                                    :  "PUT",
          }  : { idb: (fetchControl as ({ idb: UseResourceIdb }))?.idb }
        }
        fields={fields?.filter((f: any) => f.visibility ? !(selected as { id: number })?.id ? ["*", "create"]?.includes(f.visibility) : ["*", "update"]?.includes(f.visibility) : true) as FormType[]}
        defaultValue={formControl?.defaultValue ? await formControl?.defaultValue(selected || null) : selected}
        payload={formControl?.payload}
        onSuccess={() => {
          reset();
          setTimeout(() => { setToggle(`MODAL_FORM_${toggleKey}`, false) }, 900);
        }}
      />
    )
  }, [selected, fetchControl, formControl]);



  useEffect(() => {
    if(toggle[`REFRESH_${toggleKey}`] != undefined) reset();
  }, [toggle[`REFRESH_${toggleKey}`]]);


  return (
    <>
      {title && <h1 className="text-lg lg:text-xl font-bold mb-2 lg:mb-4">{title}</h1>}

      <TableComponent
        id={tableKey}
        controlBar={controlBar?.map((cb) => {
            if (cb == "CREATE") {
              if (isSm) return 

              return (
                <div className="pl-1.5 pr-3 mr-2 border-r" key="button-add">
                  <ButtonComponent
                    icon={"solid/plus"}
                    label={l.base.add ? l.base.add() : "Add"}
                    size="sm"
                    onClick={() => {
                      setToggle(`MODAL_FORM_${toggleKey}`)
                      setSelected(null)
                    }}
                  />
                </div>
              )
            }

            if (cb == "IMPORT") {
              return (
                <div className="px-1.5 rounded-md relative" key={"import"}>
                  <ButtonComponent
                    icon={"solid/file-excel"}
                    variant="outline"
                    className="!text-foreground"
                    onClick={() => setToggle(`MODAL_IMPORT_${toggleKey}`)}
                    size="sm"
                  />
                </div>
              )
            }

            if (cb == "EXPORT") {
              return (
                <div className="px-1.5 rounded-md relative" key={"export-excel"}>
                  <ButtonComponent
                    icon={"solid/file-excel"}
                    variant="outline"
                    className="!text-foreground"
                    onClick={() => setToggle(`MODAL_EXPORT_${toggleKey}`)}
                    size="sm"
                  />
                </div>
              )
            }

            if (cb == "PRINT") {
              return (
                <div className="px-1.5 rounded-md relative" key={"export-pdf"}>
                  <ButtonComponent
                    icon={"solid/file-pdf"}
                    label={l.base.print ? l.base.print() : "Print"}
                    variant="outline"
                    className="!text-foreground"
                    onClick={() => setToggle(`MODAL_PRINT_${toggleKey}`)}
                    size="sm"
                  />
                </div>
              )
            }

            return cb
          }) || [
          ...(!isSm ? [
            <div className="pl-1.5 pr-3 mr-2 border-r" key="button-add">
              <ButtonComponent
                icon={"solid/plus"}
                label={l.base.add ? l.base.add() : "Add"}
                size="sm"
                onClick={() => {
                  setToggle(`MODAL_FORM_${toggleKey}`)
                  setSelected(null)
                }}
              />
            </div>
          ] : []), 
          "SEARCH", 
          ...(columns?.filter((c) => !!(c as { filterable?: any }).filterable)?.length ? ["FILTER"] : []),
          ...(columns?.filter((c) => !!(c as { sortable?: any }).sortable)?.length ? ["SORT"] : []),
          "SELECTABLE", "REFRESH",
        ]}
        columns={columns as TableColumnType[]}
        data={dataTables}
        onRowClick={onRowClick ? onRowClick : detailControl != false ? (e) => {
          setToggle(`MODAL_SHOW_${toggleKey}`)
          setSelected(e)
        } : undefined}
        actionBulking={actionBulkingControl}
        checks={checks || []}
        onChangeChecks={(e) => setChecks(e)}
        block={block}
        focus={focus}
        noIndex={noIndex}
        responsiveControl={responsiveControl ? {
          mobile: responsiveControl?.mobile ? {
            ...(typeof responsiveControl.mobile === 'object' ? responsiveControl.mobile : {}),
            leftActionControl: (typeof responsiveControl.mobile === 'object' && responsiveControl.mobile.leftActionControl !== undefined) ? responsiveControl.mobile.leftActionControl : (Array.isArray(actionControl) ? actionControl : (actionControl || actionControl == undefined) ? ['EDIT', "DELETE"] : []).includes('EDIT') ? {
              icon: "solid/edit",
              onAction: (item) => {
                setToggle(`MODAL_FORM_${toggleKey}`);
                item && setSelected?.(item);
              }
            } : undefined,
            rightActionControl: (typeof responsiveControl.mobile === 'object' && responsiveControl.mobile.rightActionControl !== undefined) ? responsiveControl.mobile.rightActionControl : (Array.isArray(actionControl) ? actionControl : (actionControl || actionControl == undefined) ? ['EDIT', "DELETE"] : []).includes('DELETE') ? {
              icon: "solid/trash",
              onAction: (item) => {
                setToggle(`MODAL_DELETE_${toggleKey}`);
                item && setSelected?.(item);
              }
            } : undefined
          } : undefined,
        } : undefined}
        {...tableControl}
      />

      {controlBar?.find((cb) => cb == "CREATE") && (
        <ButtonComponent
          icon={"solid/plus"}
          className="fixed bottom-24 right-4 w-14 h-14 z-20 md:hidden"
          size="lg"
          rounded
          onClick={() => {
            setToggle(`MODAL_FORM_${toggleKey}`)
            setSelected(null)
          }}
        />
      )}


      <FloatingPageComponent
        show={!!toggle[`MODAL_SHOW_${toggleKey}`]}
        onClose={() => setToggle(`MODAL_SHOW_${toggleKey}`, false)}
        title={l.base.detailTitle ? l.base.detailTitle() : "Detail"}
        className="bg-background"
        footer={renderTableAction(actionControl, undefined, {className: isSm ? "justify-end p-2 bg-background" : "justify-end", size: isSm ? "sm" : "md"})}
      >
        {detailPage}
      </FloatingPageComponent>


      <FloatingPageComponent
        show={!!toggle[`MODAL_FORM_${toggleKey}`]}
        onClose={() => setToggle(`MODAL_FORM_${toggleKey}`, false)}
        title={!!selected ? (l.base.editTitle ? l.base.editTitle() : "Edit") : (l.base.addTitle ? l.base.addTitle() : "Add")}
        className={cn("bg-white", formControl?.modalControl?.className)}
      >
        <div className="p-4">
          {formPage}
        </div>
      </FloatingPageComponent>


      <FloatingPageComponent
        show={!!toggle[`MODAL_EXPORT_${toggleKey}`]}
        onClose={() => setToggle(`MODAL_EXPORT_${toggleKey}`, false)}
        title={l.base.exportTitle ? l.base.exportTitle() : "Export"}
        className="bg-white md:w-[1200px] max-w-[1200px]"
      >
        <ExportExcel 
          fetchControl={fetchControl} 
          filename={"export"}
          columnControl={columns?.map((cc) => ({
            label: cc.label || "",
            selector: cc.selector || "",
          }))} 
        />
      </FloatingPageComponent>


      <FloatingPageComponent
        show={!!toggle[`MODAL_IMPORT_${toggleKey}`]}
        onClose={() => setToggle(`MODAL_IMPORT_${toggleKey}`, false)}
        title={l.base.importTitle ? l.base.importTitle() : "Import"}
        className="bg-white md:w-[1200px] max-w-[1200px]"
      >
        <ImportExcel 
          submitControl={{ path: (fetchControl as ApiType)?.path + "/import" }}
          columnControl={columns?.map((cc) => ({
            label: cc.label || "",
            selector: cc.selector || "",
          }))} 
        />
      </FloatingPageComponent>


      {/* <FloatingPageComponent
        show={!!toggle[`MODAL_PRINT_${toggleKey}`]}
        onClose={() => setToggle(`MODAL_PRINT_${toggleKey}`, false)}
        title="Print PDF"
        className="bg-white md:w-[1200px] max-w-[1200px]"
      >
        <PrintTable 
          fetchControl={fetchControl} 
          columnControl={columns?.map((cc) => ({
            label: cc.label || "",
            selector: cc.selector || "",
          }))} 
          title={"Print - " + title}
        />
      </FloatingPageComponent> */}


      <ModalConfirmComponent
        show={!!toggle[`MODAL_DELETE_${toggleKey}`]}
        onClose={() => setToggle(`MODAL_DELETE_${toggleKey}`, false)}
        title={l.base.deleteTitle ? l.base.deleteTitle({ data: selected?.[columns?.at(0)?.selector || ""] }) : `Delete ${selected?.[columns?.at(0)?.selector || ""]}?`}
        submitControl={{
          onSubmit: {
            ...((fetchControl as ApiType).path 
              ? {path: `${(fetchControl as ApiType).path}/${(selected as { id: number })?.id || ""}`} 
              : (fetchControl as ApiType).url ? {url: `${(fetchControl as ApiType).url}/${(selected as { id: number })?.id || ""}`}
              : { idb: { ...(fetchControl as ({ idb: UseResourceIdb }))?.idb, id: (selected as { id: number })?.id || "" }}
            ),
            method: "DELETE",
          },
          onSuccess: () => {
            reset();
            setTimeout(() => { setToggle(`MODAL_DELETE_${toggleKey}`, false) }, 900);
          },
        }}
      />

      {actionControl && Array.isArray(actionControl) && actionControl.filter((ac) => typeof ac == "object")?.map((ac, acKey) => {
        const submitControl = ac.modal?.submitControl?.onSubmit as ApiType;
        return (
          <ModalConfirmComponent
            key={acKey}
            show={!!toggle[`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${toggleKey}`]}
            onClose={() => setToggle(`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${toggleKey}`, false)}
            title={ac?.modal?.title || ac.label}
            className={ac?.modal?.className}
            submitControl={{
              onSubmit: {
                ...(submitControl?.path 
                  ? {path: `${submitControl?.path}/${(selected as { id: number })?.id || ""}`} 
                  : {url: `${submitControl?.url}/${(selected as { id: number })?.id || ""}`}
                ),
                method: submitControl?.method || "POST",
              },
              onSuccess: () => {
                reset();
                setToggle(`MODAL_${conversion.strSnake(ac.label).toUpperCase()}_${conversion.strSnake(tableKey).toUpperCase()}`, false);
                setSelected(null)
                ac.modal?.submitControl?.onSuccess?.()
              },
            }}
          >{ac.modal?.children}</ModalConfirmComponent>
        )
      })}
    </>
  );
}
